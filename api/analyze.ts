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
 * The Gemini key lives only in `process.env.GEMINI_API_KEY` here — it is
 * never bundled, never logged, never returned to the client.
 */
import { runAnalysis, AnalysisError, type AnalyzeInputFile } from './_lib/analyze-core';

export const config = {
  runtime: 'nodejs',
};

const MAX_TOTAL_BYTES = 40 * 1024 * 1024; // 40 MB safety ceiling for decoded files

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const toArrayBuffer = async (b: Blob): Promise<ArrayBuffer> => {
  if (typeof (b as any).arrayBuffer === 'function') {
    return (b as any).arrayBuffer();
  }
  // Node 18/20 Web polyfill fallback
  const buf = await (b as any).buffer;
  return buf as ArrayBuffer;
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return json(405, { error: 'Method not allowed. Use POST.' });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json(400, {
      error: 'Expected multipart/form-data. Make sure you are uploading files.',
    });
  }

  const apiMode = (form.get('apiMode') as string) === 'true';
  const bureauApiKey = (form.get('bureauApiKey') as string) ?? '';

  const rawFiles = form.getAll('files').filter((f): f is File => f instanceof File);
  if (rawFiles.length === 0) {
    return json(400, { error: 'No files were uploaded.' });
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
        });
      }
      const data = Buffer.from(bytes).toString('base64');
      files.push({ name: f.name, mimeType: f.type || 'application/octet-stream', data });
    }
  } catch (e) {
    return json(400, { error: 'Failed to read uploaded files.' });
  }

  try {
    const analysis = await runAnalysis(files, apiMode, bureauApiKey);
    return json(200, { analysis });
  } catch (e: any) {
    if (e instanceof AnalysisError) {
      // Known failure modes → structured payload the client maps to AppError.
      const status =
        e.code === 'MISSING_API_KEY' || e.code === 'NO_FILES' ? 400 : 500;
      return json(status, {
        error: e.message,
        code: e.code,
        rawLogs: e.rawLogs,
      });
    }
    // Unknown error — log server-side, return a sanitized message.
    console.error('[/api/analyze] unexpected error:', e);
    return json(500, {
      error: 'An unexpected error occurred during analysis.',
      code: 'INTERNAL',
      rawLogs: e?.message ?? String(e),
    });
  }
}
