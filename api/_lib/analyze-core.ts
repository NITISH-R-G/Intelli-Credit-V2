/**
 * Shared, environment-agnostic core for the Gemini agentic analysis loop.
 *
 * Both the Vercel serverless function (`api/analyze.ts`) and the local dev
 * harness (`server.ts`) call `runAnalysis` so prod and dev run identical logic.
 *
 * The Gemini key is read from `process.env.GEMINI_API_KEY` here — server-side
 * only, never shipped to the browser.
 */
import { GoogleGenAI } from '@google/genai';
import {
  RESPONSE_SCHEMA,
  EXTRACTION_PROMPT,
  searchCasesDeclaration,
  getMcaInfoDeclaration,
  fetchDirectorCibilDeclaration,
  calculateLtvDeclaration,
} from '../../src/lib/gemini-config';
import { callMcpTool } from './mcp-tools';
import { MAX_TEXT_CHARS } from './limits';

const MODEL = 'gemini-3-flash-preview';
const MAX_ITERATIONS = 10;
/** Per-call timeout so a single hung model request can't consume the whole budget. */
const PER_CALL_TIMEOUT_MS = 30_000;
/** Bounded retries for transient Gemini transport errors (429/5xx). */
const MAX_RETRIES = 2;
const RETRY_BASE_MS = 1_000;

export interface AnalyzeInputFile {
  name: string;
  mimeType: string;
  /** raw base64, no data: prefix */
  data: string;
}

/** Structured error returned to the client, which maps it to its `AppError`. */
export interface AnalyzeError {
  /** stable machine-readable code */
  code:
    | 'MISSING_API_KEY'
    | 'NO_FILES'
    | 'TOOL_ERROR'
    | 'SAFETY_BLOCKED'
    | 'TOO_MANY_TOOL_CALLS'
    | 'EMPTY_RESPONSE'
    | 'INVALID_JSON'
    | 'TIMEOUT'
    | 'INTERNAL';
  message: string;
  /** original stack/details for the client's "view logs" panel */
  rawLogs?: string;
}

export class AnalysisError extends Error {
  code: AnalyzeError['code'];
  rawLogs?: string;

  constructor(code: AnalyzeError['code'], message: string, rawLogs?: string) {
    super(message);
    this.name = 'AnalysisError';
    this.code = code;
    this.rawLogs = rawLogs;
  }
}

/**
 * Race a promise against a timeout so a hung model/tool call surfaces as a
 * structured `TIMEOUT` error instead of silently burning the function budget.
 */
const withTimeout = <T>(p: Promise<T>, ms: number, label: string): Promise<T> =>
  Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new AnalysisError('TIMEOUT', `${label} exceeded the ${ms}ms timeout.`)),
        ms,
      ),
    ),
  ]);

/** True for transient errors worth a bounded retry (rate limits, server faults). */
const isTransient = (e: unknown): boolean => {
  const msg = e instanceof Error ? e.message.toLowerCase() : '';
  return (
    msg.includes('429') ||
    msg.includes('503') ||
    msg.includes('500') ||
    msg.includes('service unavailable') ||
    msg.includes('rate limit') ||
    msg.includes('deadline exceeded')
  );
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Calls `generateContent` with per-call timeout and a bounded retry with
 * exponential backoff for transient errors. Non-transient errors throw
 * immediately and are mapped to `AnalysisError` by the caller.
 */
const generateWithResilience = async (
  genAI: GoogleGenAI,
  model: string,
  currentContents: any[],
  config: any,
): Promise<any> => {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await withTimeout(
        genAI.models.generateContent({ model, contents: currentContents, config }),
        PER_CALL_TIMEOUT_MS,
        'generateContent',
      );
    } catch (e) {
      lastErr = e;
      // Structured timeouts should not be retried — they indicate a stuck call.
      if (e instanceof AnalysisError && e.code === 'TIMEOUT') throw e;
      if (attempt < MAX_RETRIES && isTransient(e)) {
        await sleep(RETRY_BASE_MS * 2 ** attempt);
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
};

const buildConfig = () => ({
  tools: [
    { googleSearch: {} },
    {
      functionDeclarations: [
        searchCasesDeclaration,
        getMcaInfoDeclaration,
        fetchDirectorCibilDeclaration,
        calculateLtvDeclaration,
      ],
    },
  ],
  toolConfig: { includeServerSideToolInvocations: true },
  responseMimeType: 'application/json',
  responseSchema: RESPONSE_SCHEMA as never,
});

/**
 * Port of the client `prepareDocumentContents`. Rebuilds the `contents`
 * array from already-base64-encoded file inputs (files never hit the model
 * directly — they are passed as `inlineData` parts or as inline text).
 */
const buildContents = (files: AnalyzeInputFile[]): any[] => {
  const contents: any[] = [];

  for (const f of files) {
    if (f.mimeType === 'application/pdf' || f.mimeType.startsWith('image/')) {
      contents.push({
        role: 'user',
        parts: [
          {
            inlineData: {
              data: f.data,
              mimeType: f.mimeType,
            },
          },
        ],
      });
    } else {
      // Decode base64 text and apply the same cap the client used.
      const text = Buffer.from(f.data, 'base64').toString('utf-8');
      contents.push({
        role: 'user',
        parts: [
          {
            text: `Document Name: ${f.name}\n\nDocument Text:\n${text.substring(0, MAX_TEXT_CHARS)}`,
          },
        ],
      });
    }
  }

  if (contents.length > 0) {
    contents[contents.length - 1].parts.push({ text: EXTRACTION_PROMPT });
  }

  return contents;
};

/**
 * Port of the client `executeAIExtractionLoop`. Runs the model + tool-call
 * loop server-side. Throws `AnalysisError` for known failure modes so the
 * HTTP layer can map them to structured responses.
 */
export const runAnalysis = async (
  files: AnalyzeInputFile[],
  apiMode: boolean,
  bureauApiKey: string,
): Promise<any> => {
  if (!files || files.length === 0) {
    throw new AnalysisError('NO_FILES', 'No files were provided for analysis.');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Log the actionable hint server-side only; return a generic message so we
    // don't reveal which env var to expect.
    console.error('[runAnalysis] GEMINI_API_KEY is empty. Set it in the deployment environment.');
    throw new AnalysisError('MISSING_API_KEY', 'The analysis service is not fully configured.');
  }

  const genAI = new GoogleGenAI({ apiKey });
  const model = MODEL;
  const currentContents = buildContents(files);
  const config = buildConfig();

  let extractionResponse = await generateWithResilience(genAI, model, currentContents, config);

  let iterations = 0;
  while (
    extractionResponse.functionCalls &&
    extractionResponse.functionCalls.length > 0 &&
    iterations < MAX_ITERATIONS
  ) {
    const call = extractionResponse.functionCalls[0];

    let toolResult;
    if (
      call.name === 'search_cases' ||
      call.name === 'fetch_director_cibil' ||
      call.name === 'calculate_ltv' ||
      call.name === 'get_mca_info'
    ) {
      toolResult = await callMcpTool(call.name, call.args, apiMode, bureauApiKey);
    } else {
      toolResult = { error: 'Unknown tool' };
    }

    if (toolResult && toolResult.error) {
      throw new AnalysisError('TOOL_ERROR', `Tool error: ${toolResult.error}`);
    }

    currentContents.push(extractionResponse.candidates![0].content);
    currentContents.push({
      role: 'user',
      parts: [
        {
          functionResponse: {
            name: call.name,
            response: { result: toolResult },
          },
        },
      ],
    });

    extractionResponse = await generateWithResilience(genAI, model, currentContents, config);

    iterations++;
  }

  if (!extractionResponse.text) {
    if (extractionResponse.functionCalls && extractionResponse.functionCalls.length > 0) {
      throw new AnalysisError(
        'TOO_MANY_TOOL_CALLS',
        'Analysis stopped: Too many tool calls required. The model is still trying to gather information.',
      );
    }

    const finishReason = extractionResponse.candidates?.[0]?.finishReason;
    if (finishReason === 'SAFETY') {
      throw new AnalysisError(
        'SAFETY_BLOCKED',
        'Analysis Failed: The document content was flagged by safety filters.',
      );
    }

    throw new AnalysisError(
      'EMPTY_RESPONSE',
      'Failed to extract data from document: The model returned an empty response.',
    );
  }

  try {
    return JSON.parse(extractionResponse.text);
  } catch {
    throw new AnalysisError(
      'INVALID_JSON',
      'The model returned a response that was not valid JSON.',
      extractionResponse.text,
    );
  }
};
