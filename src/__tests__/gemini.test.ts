import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { callMcpTool } from '../lib/gemini';

describe('callMcpTool', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('handles network failure during fetch_director_cibil in api mode', async () => {
    // Mock fetch to reject
    vi.mocked(fetch).mockRejectedValue(new Error('Network failure'));

    const result = await callMcpTool('fetch_director_cibil', {}, true, 'dummy-key');

    expect(result).toEqual({ error: "Network error: Failed to reach the Bureau API endpoint. Check your connection." });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.bureau-example.com/v1/cibil",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Authorization": "Bearer dummy-key",
          "Content-Type": "application/json"
        }
      })
    );
  });

  it('handles non-ok response from fetch_director_cibil in api mode', async () => {
    // Mock fetch to return non-ok response
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    } as Response);

    const result = await callMcpTool('fetch_director_cibil', {}, true, 'dummy-key');

    expect(result).toEqual({ error: "Bureau API returned status 500: Internal Server Error" });
  });
});
