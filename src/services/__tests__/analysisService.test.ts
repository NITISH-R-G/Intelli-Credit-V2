import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import {
  calculateDisplayAnalysis,
  calculateRiskAndFraud,
  performAnalysis,
} from '../analysisService';
import { CreditAnalysis } from '../../types';
import * as fileUtils from '../../lib/file-utils';

describe('calculateRiskAndFraud', () => {
  const getBaseMockParsedData = (): any => ({
    companyInfo: {
      name: 'Test Co',
      establishedYear: 2010,
      industry: 'Manufacturing',
      registrationNumber: '123',
      employees: '50',
    },
    structuredData: {
      revenue: [{ year: '2023', value: 1000000 }],
      debt: [{ year: '2023', value: 200000 }],
      cashflow: [{ year: '2023', value: 150000 }],
      profit: [{ year: '2023', value: 100000 }],
      assets: [{ year: '2023', value: 500000 }],
      liabilities: [{ year: '2023', value: 250000 }],
    },
    fraudDetection: [],
    unstructuredInsights: {
      boardMeetingNotes: [],
      ratingAgencyReports: '',
      shareholdingPattern: '',
    },
    externalIntelligence: {
      mcaStatus: 'Active',
      legalDisputes: [],
      newsSectorTrends: [],
    },
    primaryInsights: {
      siteVisitObservations: [],
      managementInterviews: [],
    },
    verificationLayer: [],
    fiveCs: {
      character: { score: 80, insights: [], redFlags: [], positiveSignals: [] },
      capacity: { score: 80, insights: [], redFlags: [], positiveSignals: [] },
      capital: { score: 80, insights: [], redFlags: [], positiveSignals: [] },
      collateral: { score: 80, insights: [], redFlags: [], positiveSignals: [] },
      conditions: { score: 80, insights: [], redFlags: [], positiveSignals: [] },
    },
  });

  it('calculates risk for a healthy company correctly', () => {
    const mock = getBaseMockParsedData();
    const result = calculateRiskAndFraud(mock);
    expect(result.riskLevel).toBe('Medium');
    expect(result.riskScore).toBe(50);
    expect(result.fraudFlags).toHaveLength(0);
    expect(result.ratios.profitMargin).toBe(0.1);
  });

  it('flags extreme leverage', () => {
    const mock = getBaseMockParsedData();
    mock.structuredData.debt[0].value = 2000000;
    mock.structuredData.assets[0].value = 500000; // debt > assets * 2
    const result = calculateRiskAndFraud(mock);
    expect(result.fraudFlags).toContain('Extreme leverage detected');
  });

  it('flags impossible state if profit > revenue', () => {
    const mock = getBaseMockParsedData();
    mock.structuredData.revenue[0].value = 100000;
    mock.structuredData.profit[0].value = 150000; // profit > revenue
    const result = calculateRiskAndFraud(mock);
    expect(result.fraudFlags).toContain('Profit exceeds revenue (Impossible state)');
    expect(result.recommendation).toBe('Reject');
  });

  it('penalizes shell company indicators', () => {
    const mock = getBaseMockParsedData();
    mock.fraudDetection = [{ indicator: 'Shell Company', details: 'test', status: 'Fail' }];
    mock.shellCompanyAnalysis = {
      isPotentialShell: true,
      riskLevel: 'High',
      indicators: [{ name: 'Test', details: 'test', status: 'Fail' }],
      operationalEvidence: ['virtual office', 'no physical assets'],
    };
    const result = calculateRiskAndFraud(mock);
    expect(result.riskScore).toBeGreaterThan(85);
    expect(result.riskLevel).toBe('Critical');
    expect(result.fraudFlags.some((f) => f.includes('Shell Indicator'))).toBe(true);
  });

  it('penalizes high risk score logic', () => {
    const mock = getBaseMockParsedData();
    mock.structuredData.debt[0].value = 1000000;
    mock.structuredData.revenue[0].value = 100000;
    mock.structuredData.cashflow[0].value = -10000;
    mock.verificationLayer = [{ status: 'Mismatch' }, { status: 'Mismatch' }];
    const result = calculateRiskAndFraud(mock);
    expect(result.riskScore).toBeGreaterThan(85);
    expect(result.riskLevel).toBe('Critical');
    expect(result.recommendation).toBe('Reject');
  });

  it('penalizes missing or dormant external intelligence', () => {
    const mock = getBaseMockParsedData();
    mock.externalIntelligence.mcaStatus = 'Struck Off';
    mock.externalIntelligence.legalDisputes = ['Fraud dispute found'];
    mock.unstructuredInsights.shareholdingPattern = 'Complex opaque pattern';
    mock.primaryInsights.siteVisitObservations = ['No physical operations found'];
    const result = calculateRiskAndFraud(mock);
    expect(result.riskScore).toBeGreaterThan(85);
    expect(result.fraudFlags.some((f) => f.includes('MCA Status'))).toBe(true);
  });

  it('penalizes negative rating agency reports and bad management interviews', () => {
    const mock = getBaseMockParsedData();
    mock.unstructuredInsights.ratingAgencyReports = 'Company downgrade due to default';
    mock.primaryInsights.managementInterviews = ['evasive and contradictory answers'];
    mock.unstructuredInsights.boardMeetingNotes = ['related party transaction'];
    const result = calculateRiskAndFraud(mock);
    expect(result.riskScore).toBeGreaterThan(85);
    expect(result.fraudFlags.some((f) => f.includes('Negative rating agency'))).toBe(true);
    expect(result.fraudFlags.some((f) => f.includes('Evasive'))).toBe(true);
    expect(result.fraudFlags.some((f) => f.includes('Unusual board meeting'))).toBe(true);
  });

  it('penalizes director shareholder rapid changes and negative news', () => {
    const mock = getBaseMockParsedData();
    mock.directorShareholderHistory = {
      hasRapidChanges: true,
      riskLevel: 'High',
    };
    mock.externalIntelligence.newsSectorTrends = ['fraud scandal'];
    const result = calculateRiskAndFraud(mock);
    expect(result.riskScore).toBeGreaterThan(85);
    expect(result.fraudFlags.some((f) => f.includes('Negative news'))).toBe(true);
    expect(result.fraudFlags.some((f) => f.includes('History Alert'))).toBe(true);
  });

  it('handles edge cases: low employees, early age, missing fields', () => {
    const mock = getBaseMockParsedData();
    // High revenue, young age
    mock.companyInfo.establishedYear = new Date().getFullYear();
    mock.structuredData.revenue[0].value = 200000000;

    // Low employees
    mock.companyInfo.employees = '2';

    // Missing fields fallback check
    mock.fraudDetection = undefined;
    mock.companyInfo.establishedYear = undefined;

    const result = calculateRiskAndFraud(mock);
    expect(
      result.fraudFlags.some((f) =>
        f.includes('Unusually high revenue for a newly established entity'),
      ),
    ).toBe(true);
    expect(result.fraudFlags.some((f) => f.includes('low employee count'))).toBe(true);
  });

  it('flags extreme revenue growth and low profitability', () => {
    const mock = getBaseMockParsedData();
    mock.structuredData.revenue = [
      { year: '2022', value: 100000 },
      { year: '2023', value: 200000000 },
    ];
    mock.structuredData.profit = [
      { year: '2022', value: 10000 },
      { year: '2023', value: 1000 }, // < 1% profit
    ];
    const result = calculateRiskAndFraud(mock);
    expect(result.fraudFlags.some((f) => f.includes('Extreme revenue growth'))).toBe(true);
    expect(
      result.fraudFlags.some((f) => f.includes('low profitability relative to high revenue')),
    ).toBe(true);
  });
});

describe('calculateDisplayAnalysis', () => {
  const getBaseMockAnalysis = (): CreditAnalysis => ({
    companyInfo: {
      name: 'Test Co',
      establishedYear: 2010,
      industry: 'Manufacturing',
      registrationNumber: '123',
      employees: '50',
    },
    structuredData: {
      revenue: [{ year: '2023', value: 1000000 }],
      debt: [{ year: '2023', value: 200000 }],
      cashflow: [{ year: '2023', value: 150000 }],
      profit: [{ year: '2023', value: 100000 }],
      assets: [{ year: '2023', value: 500000 }],
      liabilities: [{ year: '2023', value: 250000 }],
    },
    suggestedInterestRate: '10%',
    suggestedLoanAmount: '500000',
    decisionConfidence: 80,
    fraudDetection: [],
    fraudFlags: [],
    ratios: {
      debtToIncome: 0.2,
      profitMargin: 0.1,
      currentRatio: 2.0,
      dscr: 1.5,
      icr: 2.0,
    },
    riskScore: 30,
    riskLevel: 'Low',
    riskGrade: 'AAA',
    recommendation: 'Approve',
    unstructuredInsights: {
      boardMeetingNotes: [],
      ratingAgencyReports: '',
      shareholdingPattern: '',
    },
    externalIntelligence: {
      mcaStatus: 'Active',
      legalDisputes: [],
      newsSectorTrends: [],
    },
    primaryInsights: {
      siteVisitObservations: [],
      managementInterviews: [],
    },
    verificationLayer: [],
    fiveCs: {
      character: { score: 80, insights: [], redFlags: [], positiveSignals: [] },
      capacity: { score: 80, insights: [], redFlags: [], positiveSignals: [] },
      capital: { score: 80, insights: [], redFlags: [], positiveSignals: [] },
      collateral: { score: 80, insights: [], redFlags: [], positiveSignals: [] },
      conditions: { score: 80, insights: [], redFlags: [], positiveSignals: [] },
    },
    camMarkdown: '',
    riskAnalysisDetails: {
      financialRisk: '',
      legalRisk: '',
      behavioralRisk: '',
      industryRisk: '',
      managementRisk: '',
    },
    explanation: '',
    missingData: [],
    requiredDocs: [],
  });

  it('returns null if analysis is null', () => {
    expect(calculateDisplayAnalysis(null, 0, 0)).toBeNull();
  });

  it('returns unstressed analysis if shocks are 0', () => {
    const mock = getBaseMockAnalysis();
    const result = calculateDisplayAnalysis(mock, 0, 0);
    expect(result).not.toBeNull();
    expect(result?.ratios.dscr).toBe(1.5);
  });

  it('calculates stressed financials correctly with shocks', () => {
    const mock = getBaseMockAnalysis();
    const result = calculateDisplayAnalysis(mock, -20, 5);

    expect(result).not.toBeNull();
    expect(result?.structuredData.profit[0].value).toBe(80000);
    expect(result?.structuredData.cashflow[0].value).toBe(50000);

    expect(result?.ratios.profitMargin).toBeCloseTo(0.0625);
    expect(result?.ratios.debtToIncome).toBeCloseTo(0.25);
    expect(result?.ratios.dscr).toBe(1.0);
    expect(result?.ratios.icr).toBeCloseTo(2.666, 2);
  });

  it('handles zero revenue gracefully', () => {
    const mock = getBaseMockAnalysis();
    mock.structuredData.revenue[0].value = 0;
    mock.structuredData.profit[0].value = 0;
    mock.structuredData.debt[0].value = 0;

    const result = calculateDisplayAnalysis(mock, -10, 5);

    expect(result?.ratios.profitMargin).toBe(0);
    expect(result?.ratios.debtToIncome).toBe(0);
    expect(result?.ratios.dscr).toBe(0);
    expect(result?.ratios.icr).toBe(0);
  });

  describe('suggestedLoanAmount parsing', () => {
    it('handles numeric loan amount', () => {
      const mock = getBaseMockAnalysis();
      mock.suggestedLoanAmount = '150000';
      const result = calculateDisplayAnalysis(mock, -20, 0);
      // Using replace to remove narrow no-break space which might be added by toLocaleString in some environments
      const formatted = result?.suggestedLoanAmount.replace(/\u202F/g, ' ');
      const expected = (135000)
        .toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
        .replace(/\u202F/g, ' ');
      expect(formatted).toBe(expected);
    });

    it('handles string loan amount without units', () => {
      const mock = getBaseMockAnalysis();
      mock.suggestedLoanAmount = '150000';
      const result = calculateDisplayAnalysis(mock, -20, 0);
      const formatted = result?.suggestedLoanAmount.replace(/\u202F/g, ' ');
      const expected = (135000)
        .toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
        .replace(/\u202F/g, ' ');
      expect(formatted).toBe(expected);
    });

    it('handles string loan amount with "Cr" (Crores)', () => {
      const mock = getBaseMockAnalysis();
      mock.suggestedLoanAmount = '2.5 Cr';
      // Need a shock to trigger recalculation, otherwise it just returns the original string
      const result = calculateDisplayAnalysis(mock, -20, 0);
      // Base: 2.5 * 10,000,000 = 25,000,000
      // Shock: -20% -> 25,000,000 * (1 - 20/200) = 25,000,000 * 0.9 = 22,500,000
      const formatted = result?.suggestedLoanAmount.replace(/\s/g, '');
      const expected = (22500000)
        .toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
        .replace(/\s/g, '');
      expect(formatted).toBe(expected);
    });

    it('handles string loan amount with "Lakh"', () => {
      const mock = getBaseMockAnalysis();
      mock.suggestedLoanAmount = '15 Lakh';
      const result = calculateDisplayAnalysis(mock, -20, 0);
      // Base: 15 * 100,000 = 1,500,000
      // Shock: -20% -> 1,500,000 * 0.9 = 1,350,000
      const formatted = result?.suggestedLoanAmount.replace(/\s/g, '');
      const expected = (1350000)
        .toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
        .replace(/\s/g, '');
      expect(formatted).toBe(expected);
    });

    it('handles string loan amount as a range', () => {
      const mock = getBaseMockAnalysis();
      mock.suggestedLoanAmount = '10-20 Lakhs';
      const result = calculateDisplayAnalysis(mock, -20, 0);
      // Base: 10 * 100,000 = 1,000,000
      // Shock: -20% -> 1,000,000 * 0.9 = 900,000
      const formatted = result?.suggestedLoanAmount.replace(/\s/g, '');
      const expected = (900000)
        .toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
        .replace(/\s/g, '');
      expect(formatted).toBe(expected);
    });

    it('handles non-matching string gracefully', () => {
      const mock = getBaseMockAnalysis();
      mock.suggestedLoanAmount = 'Unspecified';
      const result = calculateDisplayAnalysis(mock, -20, 0);
      const formatted = result?.suggestedLoanAmount.replace(/\s/g, '');
      const expected = (0)
        .toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
        .replace(/\s/g, '');
      expect(formatted).toBe(expected);
    });
  });

  describe('risk scoring and grading', () => {
    it('assigns Critical risk level if score > 85', () => {
      const mock = getBaseMockAnalysis();
      mock.structuredData.revenue[0].value = 1000;
      mock.structuredData.profit[0].value = 10;
      mock.structuredData.debt[0].value = 100000;
      const result = calculateDisplayAnalysis(mock, -50, 20);

      expect(result?.riskScore).toBeGreaterThan(85);
      expect(result?.riskLevel).toBe('Critical');
      expect(result?.riskGrade).toBe('C');
      expect(result?.recommendation).toBe('Reject');
    });

    it('assigns High risk level if score > 60 and <= 85', () => {
      const mock = getBaseMockAnalysis();
      mock.fraudDetection = [
        { category: 'Test', indicator: 'Warn', status: 'Warning', details: 'Test' },
        { category: 'Test', indicator: 'Warn2', status: 'Warning', details: 'Test' },
      ];
      const result = calculateDisplayAnalysis(mock, -1, 0);

      expect(result?.riskScore).toBeGreaterThan(60);
      expect(result?.riskScore).toBeLessThanOrEqual(85);
      expect(result?.riskLevel).toBe('High');
      expect(result?.riskGrade).toBe('BB');
      expect(result?.recommendation).toBe('Refer for Review');
    });

    it('assigns Medium risk level if score > 30 and <= 60', () => {
      const mock = getBaseMockAnalysis();
      mock.structuredData.revenue[0].value = 1000000;
      mock.structuredData.profit[0].value = 200000;
      mock.structuredData.debt[0].value = 10000;
      const result = calculateDisplayAnalysis(mock, -1, 0);

      expect(result?.riskScore).toBeGreaterThan(30);
      expect(result?.riskScore).toBeLessThanOrEqual(60);
      expect(result?.riskLevel).toBe('Medium');
      expect(result?.riskGrade).toBe('BBB');
      expect(result?.recommendation).toBe('Approve with Conditions');
    });

    it('applies industry specific benchmarks', () => {
      const mock = getBaseMockAnalysis();
      mock.companyInfo.industry = 'IT';
      const result = calculateDisplayAnalysis(mock, -1, 0);
      expect(result?.riskScore).toBeGreaterThanOrEqual(65);
    });
  });

  describe('fraud flags and penalties', () => {
    it('penalizes risk score based on critical and warning fraud detections', () => {
      const mock = getBaseMockAnalysis();
      mock.fraudDetection = [
        { category: 'Test', indicator: 'Fail1', status: 'Fail', details: 'test' },
        { category: 'Test', indicator: 'Warn1', status: 'Warning', details: 'test' },
      ];
      const result = calculateDisplayAnalysis(mock, -1, 0);
      expect(result?.riskScore).toBeGreaterThanOrEqual(85);
      expect(result?.fraudFlags).toContain('FORENSIC: Fail1');
    });

    it('does not penalize if there are no fraud detections or they are all Pass', () => {
      const mock = getBaseMockAnalysis();
      mock.fraudDetection = [
        { category: 'Test', indicator: 'Pass1', status: 'Pass', details: 'test' },
      ];
      const result = calculateDisplayAnalysis(mock, -1, 0);
      expect(result?.fraudFlags.some((f) => f.includes('FORENSIC'))).toBe(false);
    });
  });

  describe('Five Cs capacities penalties', () => {
    it('penalizes capacity score if stressedDSCR < 1.2', () => {
      const mock = getBaseMockAnalysis();
      mock.fiveCs.capacity.score = 80;
      mock.structuredData.revenue[0].value = 1000;
      mock.structuredData.profit[0].value = 10;
      mock.structuredData.debt[0].value = 100000;
      const result = calculateDisplayAnalysis(mock, -10, 10);

      expect(result?.fiveCs.capacity.score).toBe(60); // 80 - 20
    });

    it('penalizes capital score if stressedDebtToIncome > 0.8', () => {
      const mock = getBaseMockAnalysis();
      mock.fiveCs.capital.score = 80;
      mock.structuredData.debt[0].value = 900000;
      mock.structuredData.revenue[0].value = 1000000;
      const result = calculateDisplayAnalysis(mock, -1, 0);

      expect(result?.fiveCs.capital.score).toBe(60); // 80 - 20
    });
  });

  describe('Decision Confidence', () => {
    it('reduces confidence based on shock factor', () => {
      const mock = getBaseMockAnalysis();
      mock.decisionConfidence = 90;
      const result = calculateDisplayAnalysis(mock, -20, 10);
      expect(result?.decisionConfidence).toBe(20);
    });
  });
});

/**
 * The Gemini model call + agentic tool loop (formerly
 * `prepareDocumentContents` and `executeAIExtractionLoop`) now live
 * server-side in `/api/analyze`. Their tests moved to
 * `api/_lib/__tests__/`. Only `performAnalysis`'s client-side behavior
 * (caching, fetch, error mapping) is unit-tested here.
 */
describe('performAnalysis', () => {
  let mockSetLoading: any;
  let mockSetError: any;
  let mockSetAnalysis: any;
  let mockSetShowLogs: any;
  let mockFileCache: any;

  beforeEach(() => {
    mockSetLoading = vi.fn();
    mockSetError = vi.fn();
    mockSetAnalysis = vi.fn();
    mockSetShowLogs = vi.fn();
    mockFileCache = { current: new Map() };
    // jsdom doesn't provide fetch; stub it as a spy so the cached-path test
    // can assert it was NOT called, and the network tests can override it.
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const callPerformAnalysis = (files: File[]) =>
    performAnalysis(
      files,
      mockFileCache,
      false,
      '',
      mockSetLoading,
      mockSetError,
      mockSetAnalysis,
      mockSetShowLogs,
    );

  it('returns early if files array is empty', async () => {
    await callPerformAnalysis([]);
    expect(mockSetLoading).not.toHaveBeenCalled();
  });

  it('returns cached analysis if hash matches', async () => {
    vi.spyOn(fileUtils, 'hashFile').mockResolvedValue('testhash');
    mockFileCache.current.set('testhash', { riskScore: 50 });

    const mockFile = new File([''], 'test.pdf');
    await callPerformAnalysis([mockFile]);

    expect(mockSetAnalysis).toHaveBeenCalledWith({ riskScore: 50 });
    expect(mockSetLoading).toHaveBeenCalledWith(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  const mockOkResponse = (body: unknown) =>
    ({
      ok: true,
      json: async () => body,
    }) as Response;

  it('POSTs files to /api/analyze, runs risk calc, caches and sets analysis', async () => {
    vi.spyOn(fileUtils, 'hashFile').mockResolvedValue('uniquemhash');
    // Minimal shape that survives calculateRiskAndFraud post-processing.
    // Complete CreditAnalysis shape — the server always returns one that
    // satisfies RESPONSE_SCHEMA, and calculateRiskAndFraud reads many fields.
    const serverAnalysis = {
      companyInfo: {
        name: 'Co',
        establishedYear: 2020,
        industry: 'IT',
        registrationNumber: 'r',
        employees: '10',
      },
      structuredData: {
        revenue: [{ year: '2023', value: 1000000 }],
        debt: [{ year: '2023', value: 100000 }],
        cashflow: [{ year: '2023', value: 100000 }],
        profit: [{ year: '2023', value: 100000 }],
        assets: [{ year: '2023', value: 500000 }],
        liabilities: [{ year: '2023', value: 200000 }],
      },
      verificationLayer: [],
      fraudDetection: [],
      unstructuredInsights: {
        boardMeetingNotes: [],
        ratingAgencyReports: '',
        shareholdingPattern: '',
      },
      externalIntelligence: { mcaStatus: 'Active', legalDisputes: [], newsSectorTrends: [] },
      mcpData: { },
      primaryInsights: { siteVisitObservations: [], managementInterviews: [] },
      fiveCs: {
        character: { score: 70, insights: [], redFlags: [], positiveSignals: [] },
        capacity: { score: 70, insights: [], redFlags: [], positiveSignals: [] },
        capital: { score: 70, insights: [], redFlags: [], positiveSignals: [] },
        collateral: { score: 70, insights: [], redFlags: [], positiveSignals: [] },
        conditions: { score: 70, insights: [], redFlags: [], positiveSignals: [] },
      },
    };
    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue(mockOkResponse({ analysis: serverAnalysis }));

    const mockFile = new File(['hello'], 'test.pdf', { type: 'application/pdf' });
    await callPerformAnalysis([mockFile]);

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/analyze',
      expect.objectContaining({ method: 'POST' }),
    );
    // Files + settings were sent as multipart form data.
    const sentBody = fetchSpy.mock.calls[0][1].body as FormData;
    expect(sentBody.get('files')).toBeInstanceOf(File);
    expect(sentBody.get('apiMode')).toBe('false');
    expect(sentBody.get('bureauApiKey')).toBe('');

    expect(mockSetAnalysis).toHaveBeenCalledTimes(1);
    expect(mockFileCache.current.has('uniquemhash')).toBe(true);
    expect(mockSetLoading).toHaveBeenLastCalledWith(false);
  });

  it('maps a server MISSING_API_KEY error to a Configuration Required AppError', async () => {
    vi.spyOn(fileUtils, 'hashFile').mockResolvedValue('h');
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'no key', code: 'MISSING_API_KEY' }),
    } as Response);

    await callPerformAnalysis([new File([''], 't.pdf')]);

    expect(mockSetError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Configuration Required',
        type: 'API_ERROR',
      }),
    );
    expect(mockSetShowLogs).toHaveBeenCalledWith(true);
  });

  it('maps a server SAFETY_BLOCKED error to a Content Blocked AppError', async () => {
    vi.spyOn(fileUtils, 'hashFile').mockResolvedValue('h');
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'flagged', code: 'SAFETY_BLOCKED' }),
    } as Response);

    await callPerformAnalysis([new File([''], 't.pdf')]);

    expect(mockSetError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Content Blocked', type: 'API_ERROR' }),
    );
  });

  it('maps a server INVALID_JSON error to a Data Parsing AppError', async () => {
    vi.spyOn(fileUtils, 'hashFile').mockResolvedValue('h');
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'bad json', code: 'INVALID_JSON' }),
    } as Response);

    await callPerformAnalysis([new File([''], 't.pdf')]);

    expect(mockSetError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Data Parsing Error', type: 'PARSING_ERROR' }),
    );
  });

  it('maps a network/fetch failure to a NetworkError AppError', async () => {
    vi.spyOn(fileUtils, 'hashFile').mockResolvedValue('h');
    vi.spyOn(global, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));

    await callPerformAnalysis([new File([''], 't.pdf')]);

    expect(mockSetError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Network Error', type: 'API_ERROR' }),
    );
    expect(mockSetLoading).toHaveBeenLastCalledWith(false);
  });

  it('maps a FILE_ERROR to a File Processing AppError', async () => {
    vi.spyOn(fileUtils, 'hashFile').mockRejectedValue(new Error('FILE_ERROR: corruption'));

    await callPerformAnalysis([new File([''], 't.pdf')]);

    expect(mockSetError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'File Processing Error', type: 'FILE_ERROR' }),
    );
  });
});
