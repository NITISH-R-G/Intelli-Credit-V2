/**
 * Shared upload limits and validation, used by both the production Vercel
 * function (`api/analyze.ts`) and the local-dev mirror (`server.ts`) so the
 * two paths enforce identical constraints.
 */

/** Hard ceiling on the decoded bytes across all files in one request. */
export const MAX_TOTAL_BYTES = 40 * 1024 * 1024; // 40 MB

/** Maximum number of files accepted in a single analysis request. */
export const MAX_FILE_COUNT = 20;

/** Maximum characters of text content sent to the model per text file. */
export const MAX_TEXT_CHARS = 10_000;

/**
 * MIME-type allowlist for uploads. Matches the types the UI's dropzone
 * advertises. PDFs/images become Gemini `inlineData`; the rest are decoded
 * and sent as text (capped at MAX_TEXT_CHARS).
 */
const ALLOWED_MIME_PREFIXES = ['image/'];
const ALLOWED_MIME_EXACT = new Set([
  'application/pdf',
  'text/csv',
  'text/plain',
  'application/json',
  'application/octet-stream', // browsers often send this for .csv/.txt; allowed, validated downstream
]);

export const isAllowedMimeType = (mimeType: string): boolean =>
  ALLOWED_MIME_EXACT.has(mimeType) || ALLOWED_MIME_PREFIXES.some((p) => mimeType.startsWith(p));
