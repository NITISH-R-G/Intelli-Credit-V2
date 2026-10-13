import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * runAnalysis holds the server-side Gemini key and runs the agentic loop.
 * We mock @google/genai so no network calls happen. The mock exposes a
 * mutable `__gc` so individual tests can program generateContent behavior.
 */
const gc = vi.fn();
vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = { generateContent: gc };
  },
  Type: {
    OBJECT: 'OBJECT',
    STRING: 'STRING',
    NUMBER: 'NUMBER',
    ARRAY: 'ARRAY',
    BOOLEAN: 'BOOLEAN',
  },
}));

// Imported after the mock is registered.
const { runAnalysis, AnalysisError } = await import('../analyze-core');
type AnalysisErrorLike = { code: string; message: string };

const textFile = (name: string, content: string) => ({
  name,
  mimeType: 'text/plain',
  data: Buffer.from(content).toString('base64'),
});

describe('runAnalysis input guards', () => {
  beforeEach(() => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    gc.mockReset();
  });

  it('throws NO_FILES for an empty input', async () => {
    await expect(runAnalysis([], false, '')).rejects.toMatchObject({ code: 'NO_FILES' });
  });

  it('throws MISSING_API_KEY when the server has no key', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    await expect(runAnalysis([textFile('a.txt', 'hi')], false, '')).rejects.toMatchObject({
      code: 'MISSING_API_KEY',
    });
  });
});

describe('runAnalysis resilience (per-call timeout + retry)', () => {
  beforeEach(() => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    gc.mockReset();
    vi.useRealTimers();
  });

  it('retries a transient (429) error, then succeeds', async () => {
    gc.mockImplementationOnce(() =>
      Promise.reject(new Error('429 rate limit')),
    ).mockResolvedValueOnce({
      text: JSON.stringify({ ok: true }),
      functionCalls: [],
    });

    const p = runAnalysis([textFile('a.txt', 'hi')], false, '');
    // Advance past the exponential backoff sleeps (1s on first retry).
    await vi.advanceTimersByTimeAsync(4000);
    const result = await p;

    expect(gc).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ ok: true });
  });

  it('does NOT retry a structured TIMEOUT (a hung call)', async () => {
    // A generateContent promise that never resolves → withTimeout rejects.
    gc.mockImplementation(() => new Promise(() => {}));

    // Attach a handler up-front so no rejection goes unhandled between
    // advancing the timers and the awaits below.
    const p = runAnalysis([textFile('a.txt', 'hi')], false, '');
    const captured = p.catch((e) => e);
    await vi.advanceTimersByTimeAsync(31_000);
    const err = await captured;

    expect(err).toBeInstanceOf(AnalysisError);
    expect((err as AnalysisErrorLike).code).toBe('TIMEOUT');
    expect(gc).toHaveBeenCalledTimes(1);
  });

  it('does NOT retry a non-transient (400) error', async () => {
    gc.mockImplementation(() => Promise.reject(new Error('400 bad request')));

    const p = runAnalysis([textFile('a.txt', 'hi')], false, '');
    const captured = p.catch((e) => e);
    await vi.advanceTimersByTimeAsync(4000);
    const err = await captured;

    expect(err).toBeInstanceOf(Error);
    expect((err as Error).message).toBe('400 bad request');
    expect(gc).toHaveBeenCalledTimes(1);
  });
});
