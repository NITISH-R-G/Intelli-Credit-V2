import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { callMcpTool } from '../mcp-tools';

/**
 * Relocated from `src/lib/__tests__/gemini.test.ts`. The tool dispatcher
 * moved server-side (`api/_lib/mcp-tools.ts`) and now reads the eCourts
 * key from `process.env.ECOURTS_API_KEY` instead of the client-exposed
 * `import.meta.env.VITE_ECOURTS_API_KEY`.
 */
describe('callMcpTool', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubEnv('ECOURTS_API_KEY', 'test_key');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('handles unknown tool', async () => {
    const result = await callMcpTool('unknown_tool', {}, false, '');
    expect(result).toEqual({ error: 'Unknown tool' });
  });

  describe('search_cases', () => {
    it('returns error if API key is not configured', async () => {
      vi.unstubAllEnvs(); // this removes ECOURTS_API_KEY
      const result = await callMcpTool('search_cases', { query: 'Test Company' }, false, '');
      expect(result.error).toContain('eCourts API key not configured');
    });

    it('returns cases if API key is configured', async () => {
      // ECOURTS_API_KEY is mocked in beforeEach
      const result = await callMcpTool('search_cases', { query: 'Test Company' }, false, '');
      expect(result).toEqual({
        cases: [
          {
            caseNumber: 'COM/2023/001',
            court: 'High Court',
            status: 'Pending',
            summary: `Commercial dispute involving Test Company.`,
          },
        ],
      });
    });

    it('returns cases with default entity name if query is not provided', async () => {
      const result = await callMcpTool('search_cases', {}, false, '');
      expect(result).toEqual({
        cases: [
          {
            caseNumber: 'COM/2023/001',
            court: 'High Court',
            status: 'Pending',
            summary: `Commercial dispute involving the entity.`,
          },
        ],
      });
    });
  });

  describe('fetch_director_cibil', () => {
    it('returns error in API mode if bureau API key is missing', async () => {
      const result = await callMcpTool('fetch_director_cibil', {}, true, '');
      expect(result.error).toContain('Bureau API Key is missing');
    });

    it('handles network failure during fetch_director_cibil in api mode', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network failure'));
      const result = await callMcpTool('fetch_director_cibil', {}, true, 'dummy-key');
      expect(result).toEqual({
        error: 'Network error: Failed to reach the Bureau API endpoint. Check your connection.',
      });
    });

    it('handles non-ok response from fetch_director_cibil in api mode', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);
      const result = await callMcpTool('fetch_director_cibil', {}, true, 'dummy-key');
      expect(result).toEqual({ error: 'Bureau API returned status 500: Internal Server Error' });
    });

    it('returns JSON response from fetch_director_cibil in api mode on success', async () => {
      const mockData = { score: 800 };
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response);
      const result = await callMcpTool('fetch_director_cibil', {}, true, 'dummy-key');
      expect(result).toEqual(mockData);
    });

    it('returns mock data in mock mode', async () => {
      const result = await callMcpTool('fetch_director_cibil', {}, false, '');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('status', 'Excellent');
    });
  });

  describe('calculate_ltv', () => {
    it('returns error in API mode if bureau API key is missing', async () => {
      const result = await callMcpTool('calculate_ltv', {}, true, '');
      expect(result.error).toContain('Bureau API Key is missing');
    });

    it('handles network failure during calculate_ltv in api mode', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network failure'));
      const result = await callMcpTool('calculate_ltv', {}, true, 'dummy-key');
      expect(result).toEqual({
        error: 'Network error: Failed to reach the LTV Calculation API. Check your connection.',
      });
    });

    it('handles non-ok response from calculate_ltv in api mode', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);
      const result = await callMcpTool('calculate_ltv', {}, true, 'dummy-key');
      expect(result).toEqual({
        error: 'LTV Calculation API returned status 500: Internal Server Error',
      });
    });

    it('returns JSON response from calculate_ltv in api mode on success', async () => {
      const mockData = { ltv: 0.8 };
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response);
      const result = await callMcpTool('calculate_ltv', {}, true, 'dummy-key');
      expect(result).toEqual(mockData);
    });

    it('returns mock data in mock mode', async () => {
      const result = await callMcpTool(
        'calculate_ltv',
        { assetType: 'Residential Property', marketValue: 1000 },
        false,
        '',
      );
      expect(result).toEqual({
        estimatedValue: 800,
        ltvRatio: 0.8,
        remarks: 'Standard LTV applied for Residential Property.',
      });
    });

    it('returns default mock data for unknown asset type', async () => {
      const result = await callMcpTool(
        'calculate_ltv',
        { assetType: 'Unknown', marketValue: 1000 },
        false,
        '',
      );
      expect(result).toEqual({
        estimatedValue: 500,
        ltvRatio: 0.5,
        remarks: 'Standard LTV applied for Unknown.',
      });
    });
  });

  describe('get_mca_info', () => {
    it('returns mock data in mock mode', async () => {
      const result = await callMcpTool('get_mca_info', {}, false, '');
      expect(result).toHaveProperty('status', 'Active');
      expect(result).toHaveProperty('directors');
    });

    it('returns data from POST request if successful', async () => {
      const mockData = { mcaStatus: 'Active API' };
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);
      const result = await callMcpTool('get_mca_info', { companyName: 'Test' }, true, 'dummy');
      expect(result).toEqual(mockData);
    });

    it('returns data from GET request if POST fails but GET succeeds', async () => {
      const mockData = { mcaStatus: 'Active API GET' };
      vi.mocked(fetch)
        .mockResolvedValueOnce({ ok: false } as Response)
        .mockResolvedValueOnce({ ok: true, json: async () => mockData } as Response);

      const result = await callMcpTool('get_mca_info', { companyName: 'Test' }, true, 'dummy');
      expect(result).toEqual(mockData);
    });

    it('returns error if both POST and GET fail', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce({ ok: false } as Response)
        .mockResolvedValueOnce({ ok: false, status: 404 } as Response);

      const result = await callMcpTool('get_mca_info', { companyName: 'Test' }, true, 'dummy');
      expect(result).toEqual({ error: 'MCA API returned status 404' });
    });

    it('handles network failure', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network failure'));
      const result = await callMcpTool('get_mca_info', { companyName: 'Test' }, true, 'dummy');
      expect(result).toEqual({ error: 'Failed to fetch MCA info from API' });
    });
  });

  describe('catch block', () => {
    it('returns error if an exception is thrown', async () => {
      const originalSetTimeout = global.setTimeout;
      vi.stubGlobal('setTimeout', () => {
        throw new Error('Forced exception');
      });

      const result = await callMcpTool('search_cases', {}, false, '');
      expect(result).toEqual({ error: 'Tool execution failed' });

      vi.stubGlobal('setTimeout', originalSetTimeout);
    });
  });
});
