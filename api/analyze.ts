/**
 * Vercel Serverless Function: POST /api/analyze
 *
 * Receives a multipart/form-data request with:
 *   - one or more `files` (PDF, image, csv, json, txt)
 *   - `apiMode` ("true" | "false") — whether to call real bureau/MCA endpoints
 *   - `bureauApiKey` (string) — the end-user's own bureau key (optional)
 *
 * Base64-encodes each file, runs the agentic Gemini loop via `runAnalysis`
 * (server-held key), and returns the parsed analysis JSON. The client then
 * runs the pure client-side `calculateRiskAndFraud` post-processing.
 *
 * Security posture:
 *   - The Gemini key lives only in `process.env.GEMINI_API_KEY` — never
 *     bundled, never logged, never returned to the client.
 *   - If `ANALYZE_SECRET` is set, callers must send it in the
 *     `x-analyze-secret` header; requests without it are rejected. This is a
 *     low-friction gate against public quota drain. For heavier abuse, add a
 *     stateful limiter (e.g. Upstash Ratelimit) — see the README note.
 *   - Error responses are sanitized: a short message + opaque `requestId` go
 *     to the client; full detail is logged server-side keyed by that id.
 */
import { runAnalysis, AnalysisError, type AnalyzeInputFile } from './_lib/analyze-core';
import { isAllowedMimeType, MAX_FILE_COUNT, MAX_TOTAL_BYTES } from './_lib/limits';

export const config = {
  runtime: 'nodejs',
};

const REQUEST_TIMEOUT_MS = 55_000; // bail just under Vercel's 60s function ceiling
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 100;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const toArrayBuffer = async (b: Blob): Promise<ArrayBuffer> => {
  if (typeof (b as { arrayBuffer?: () => Promise<ArrayBuffer> }).arrayBuffer === 'function') {
    return (b as { arrayBuffer: () => Promise<ArrayBuffer> }).arrayBuffer();
  }
  // Node 18/20 Web polyfill fallback
  const buf = await (b as { buffer: Promise<ArrayBuffer> }).buffer;
  return buf as ArrayBuffer;
};

/**
 * Best-effort per-instance rate limit. A Vercel serverless instance can be
 * reused across warm invocations, so this throttles bursts within a single
 * container. It is NOT a substitute for a stateful limiter (Upstash/Vercel
 * native rate limiting) against distributed abuse, but it raises the bar
 * with zero infrastructure and no latency cost.
 */
interface RateBucket {
  count: number;
  resetAt: number;
}
let rateBucket: RateBucket | null = null;

const rateLimited = (ip: string): boolean => {
  const now = Date.now();
  if (!rateBucket || now > rateBucket.resetAt) {
    rateBucket = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }
  rateBucket.count += 1;
  if (rateBucket.count > RATE_LIMIT_MAX) {
    console.warn(`[rate-limit] ${ip} exceeded ${RATE_LIMIT_MAX}/${RATE_LIMIT_WINDOW_MS}ms`);
    return true;
  }
  return false;
};

const clientIp = (req: Request): string => {
  const headers = ['x-forwarded-for', 'x-real-ip', 'cf-connecting-ip'] as const;
  for (const h of headers) {
    const v = req.headers.get(h);
    if (v) return v.split(',')[0]!.trim();
  }
  return 'unknown';
};

export default async function handler(req: Request): Promise<Response> {
  // Cheap, unique-per-request id for client correlation without leaking internals.
  const requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  if (req.method !== 'POST') {
    return json(405, { error: 'Method not allowed. Use POST.', requestId });
  }

  // Optional shared-secret gate (set ANALYZE_SECRET in Vercel env to enable).
  const secret = process.env.ANALYZE_SECRET;
  if (secret) {
    const provided = req.headers.get('x-analyze-secret');
    if (provided !== secret) {
      return json(401, { error: 'Unauthorized.', code: 'UNAUTHORIZED', requestId });
    }
  }

  // Best-effort rate limiting (warm-instance scope).
  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return json(429, {
      error: 'Too many analysis requests. Please try again later.',
      code: 'RATE_LIMITED',
      requestId,
    });
  }

  // Reject oversized payloads BEFORE buffering the body into memory.
  const contentLength = Number(req.headers.get('content-length') ?? 0);
  if (contentLength > MAX_TOTAL_BYTES) {
    return json(413, {
      error: `Upload exceeds the ${MAX_TOTAL_BYTES / 1024 / 1024}MB limit.`,
      code: 'TOO_LARGE',
      requestId,
    });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json(400, {
      error: 'Expected multipart/form-data. Make sure you are uploading files.',
      code: 'BAD_REQUEST',
      requestId,
    });
  }

  const apiMode = String(form.get('apiMode') ?? '') === 'true';
  const bureauApiKey = String(form.get('bureauApiKey') ?? '').slice(0, 512);

  const rawFiles = form.getAll('files').filter((f): f is File => f instanceof File);
  if (rawFiles.length === 0) {
    return json(400, { error: 'No files were uploaded.', code: 'NO_FILES', requestId });
  }
  if (rawFiles.length > MAX_FILE_COUNT) {
    return json(413, {
      error: `Too many files. Limit is ${MAX_FILE_COUNT}.`,
      code: 'TOO_MANY_FILES',
      requestId,
    });
  }

  // Convert each uploaded file into { name, mimeType, data(base64) }.
  const files: AnalyzeInputFile[] = [];
  let totalBytes = 0;
  try {
    for (const f of rawFiles) {
      const buf = await toArrayBuffer(f);
      const bytes = new Uint8Array(buf);
      totalBytes += bytes.byteLength;
      if (totalBytes > MAX_TOTAL_BYTES) {
        return json(413, {
          error: `Total upload size exceeds the ${MAX_TOTAL_BYTES / 1024 / 1024}MB limit.`,
          code: 'TOO_LARGE',
          requestId,
        });
      }
      const mimeType = (f.type || 'application/octet-stream').toLowerCase();
      if (!isAllowedMimeType(mimeType)) {
        return json(415, {
          error: `Unsupported file type "${mimeType}" for "${f.name}". Allowed: PDF, PNG/JPG, CSV, JSON, TXT.`,
          code: 'UNSUPPORTED_TYPE',
          requestId,
        });
      }
      const data = Buffer.from(bytes).toString('base64');
      // Drop references to the intermediate buffer as we go to bound memory.
      files.push({ name: f.name, mimeType, data });
    }
  } catch {
    return json(400, { error: 'Failed to read uploaded files.', code: 'BAD_REQUEST', requestId });
  }

  // Run the analysis with a watchdog so a hung model call can't burn the
  // entire 60s budget silently — we return a structured timeout instead.
  const analysisPromise = runAnalysis(files, apiMode, bureauApiKey);
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new AnalysisError('TIMEOUT', 'Analysis timed out. Please try fewer files.')),
      REQUEST_TIMEOUT_MS,
    ),
  );

  try {
    const analysis = await Promise.race([analysisPromise, timeoutPromise]);
    return json(200, { analysis, requestId });
  } catch (e: unknown) {
    // Always log the real error server-side, keyed by requestId.
    const err = e as Error;
    console.error(`[/api/analyze:${requestId}]`, err?.stack ?? e);

    if (e instanceof AnalysisError) {
      const status = e.code === 'MISSING_API_KEY' || e.code === 'NO_FILES' ? 400 : 500;
      // `rawLogs` may carry reflected document content / env var names —
      // only forward it for client-side-fixable issues; otherwise omit.
      const safeRawLogs =
        e.code === 'INVALID_JSON' || e.code === 'TOOL_ERROR' ? truncate(e.rawLogs) : undefined;
      return json(status, {
        error: e.message,
        code: e.code,
        rawLogs: safeRawLogs,
        requestId,
      });
    }
    // Unknown error — never forward e.message (could contain URLs/keys).
    return json(500, {
      error: 'An unexpected error occurred during analysis.',
      code: 'INTERNAL',
      requestId,
    });
  }
}

const truncate = (s: string | undefined, n = 500): string | undefined =>
  s ? (s.length > n ? `${s.slice(0, n)}…[truncated]` : s) : undefined;
