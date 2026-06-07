import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { calculateDisplayAnalysis, calculateRiskAndFraud, prepareDocumentContents, executeAIExtractionLoop, performAnalysis } from '../analysisService';
import { CreditAnalysis } from '../../types';
import * as fileUtils from '../../lib/file-utils';
import * as gemini from '../../lib/gemini';
import { EXTRACTION_PROMPT } from '../../lib/gemini-config';

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
    expect(result.fraudFlags).toContain("Extreme leverage detected");
  });

  it('flags impossible state if profit > revenue', () => {
    const mock = getBaseMockParsedData();
    mock.structuredData.revenue[0].value = 100000;
    mock.structuredData.profit[0].value = 150000; // profit > revenue
    const result = calculateRiskAndFraud(mock);
    expect(result.fraudFlags).toContain("Profit exceeds revenue (Impossible state)");
    expect(result.recommendation).toBe('Reject');
  });

  it('penalizes shell company indicators', () => {
    const mock = getBaseMockParsedData();
    mock.fraudDetection = [{ indicator: 'Shell Company', details: 'test', status: 'Fail' }];
    mock.shellCompanyAnalysis = {
      isPotentialShell: true,
      riskLevel: 'High',
      indicators: [{ name: 'Test', details: 'test', status: 'Fail' }],
      operationalEvidence: ['virtual office', 'no physical assets']
    };
    const result = calculateRiskAndFraud(mock);
    expect(result.riskScore).toBeGreaterThan(85);
    expect(result.riskLevel).toBe('Critical');
    expect(result.fraudFlags.some(f => f.includes('Shell Indicator'))).toBe(true);
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
    expect(result.fraudFlags.some(f => f.includes('MCA Status'))).toBe(true);
  });

  it('penalizes negative rating agency reports and bad management interviews', () => {
    const mock = getBaseMockParsedData();
    mock.unstructuredInsights.ratingAgencyReports = 'Company downgrade due to default';
    mock.primaryInsights.managementInterviews = ['evasive and contradictory answers'];
    mock.unstructuredInsights.boardMeetingNotes = ['related party transaction'];
    const result = calculateRiskAndFraud(mock);
    expect(result.riskScore).toBeGreaterThan(85);
    expect(result.fraudFlags.some(f => f.includes('Negative rating agency'))).toBe(true);
    expect(result.fraudFlags.some(f => f.includes('Evasive'))).toBe(true);
    expect(result.fraudFlags.some(f => f.includes('Unusual board meeting'))).toBe(true);
  });

  it('penalizes director shareholder rapid changes and negative news', () => {
    const mock = getBaseMockParsedData();
    mock.directorShareholderHistory = {
      hasRapidChanges: true,
      riskLevel: 'High'
    };
    mock.externalIntelligence.newsSectorTrends = ['fraud scandal'];
    const result = calculateRiskAndFraud(mock);
    expect(result.riskScore).toBeGreaterThan(85);
    expect(result.fraudFlags.some(f => f.includes('Negative news'))).toBe(true);
    expect(result.fraudFlags.some(f => f.includes('History Alert'))).toBe(true);
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
    expect(result.fraudFlags.some(f => f.includes('Unusually high revenue for a newly established entity'))).toBe(true);
    expect(result.fraudFlags.some(f => f.includes('low employee count'))).toBe(true);
  });

  it('flags extreme revenue growth and low profitability', () => {
    const mock = getBaseMockParsedData();
    mock.structuredData.revenue = [
      { year: '2022', value: 100000 },
      { year: '2023', value: 200000000 }
    ];
    mock.structuredData.profit = [
      { year: '2022', value: 10000 },
      { year: '2023', value: 1000 } // < 1% profit
    ];
    const result = calculateRiskAndFraud(mock);
    expect(result.fraudFlags.some(f => f.includes('Extreme revenue growth'))).toBe(true);
    expect(result.fraudFlags.some(f => f.includes('low profitability relative to high revenue'))).toBe(true);
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
      const expected = (135000).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).replace(/\u202F/g, ' ');
      expect(formatted).toBe(expected);
    });

    it('handles string loan amount without units', () => {
      const mock = getBaseMockAnalysis();
      mock.suggestedLoanAmount = '150000';
      const result = calculateDisplayAnalysis(mock, -20, 0);
      const formatted = result?.suggestedLoanAmount.replace(/\u202F/g, ' ');
      const expected = (135000).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).replace(/\u202F/g, ' ');
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
      const expected = (22500000).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).replace(/\s/g, '');
      expect(formatted).toBe(expected);
    });

    it('handles string loan amount with "Lakh"', () => {
      const mock = getBaseMockAnalysis();
      mock.suggestedLoanAmount = '15 Lakh';
      const result = calculateDisplayAnalysis(mock, -20, 0);
      // Base: 15 * 100,000 = 1,500,000
      // Shock: -20% -> 1,500,000 * 0.9 = 1,350,000
      const formatted = result?.suggestedLoanAmount.replace(/\s/g, '');
      const expected = (1350000).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).replace(/\s/g, '');
      expect(formatted).toBe(expected);
    });

    it('handles string loan amount as a range', () => {
      const mock = getBaseMockAnalysis();
      mock.suggestedLoanAmount = '10-20 Lakhs';
      const result = calculateDisplayAnalysis(mock, -20, 0);
      // Base: 10 * 100,000 = 1,000,000
      // Shock: -20% -> 1,000,000 * 0.9 = 900,000
      const formatted = result?.suggestedLoanAmount.replace(/\s/g, '');
      const expected = (900000).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).replace(/\s/g, '');
      expect(formatted).toBe(expected);
    });

    it('handles non-matching string gracefully', () => {
        const mock = getBaseMockAnalysis();
        mock.suggestedLoanAmount = 'Unspecified';
        const result = calculateDisplayAnalysis(mock, -20, 0);
        const formatted = result?.suggestedLoanAmount.replace(/\s/g, '');
        const expected = (0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).replace(/\s/g, '');
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
      mock.fraudDetection = [{ category: 'Test', indicator: 'Warn', status: 'Warning', details: 'Test' }, { category: 'Test', indicator: 'Warn2', status: 'Warning', details: 'Test' }];
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
      expect(result?.fraudFlags.some(f => f.includes('FORENSIC'))).toBe(false);
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

describe('prepareDocumentContents', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws error if no valid documents provided', async () => {
    await expect(prepareDocumentContents([])).rejects.toThrow('No valid documents found for analysis.');
  });

  it('processes image and pdf files as inlineData', async () => {
    vi.spyOn(fileUtils, 'fileToBase64').mockResolvedValue('base64DataString');
    const mockFile1 = new File([''], 'test.pdf', { type: 'application/pdf' });
    const mockFile2 = new File([''], 'test.png', { type: 'image/png' });

    const result = await prepareDocumentContents([mockFile1, mockFile2]);

    expect(result).toHaveLength(2); // 2 files
    expect(result[0].parts[0].inlineData).toEqual({ mimeType: 'application/pdf', data: 'base64DataString' });
    expect(result[1].parts[0].inlineData).toEqual({ mimeType: 'image/png', data: 'base64DataString' });

    // Checks if prompt is appended to the last part
    expect(result[1].parts[1]).toEqual({ text: EXTRACTION_PROMPT });
  });

  it('processes text/other files as text', async () => {
    vi.spyOn(fileUtils, 'fileToText').mockResolvedValue('sample document text content');
    const mockFile1 = new File([''], 'test.txt', { type: 'text/plain' });

    const result = await prepareDocumentContents([mockFile1]);

    expect(result).toHaveLength(1);
    expect(result[0].parts[0].text).toContain('Document Name: test.txt');
    expect(result[0].parts[0].text).toContain('sample document text content');
    expect(result[0].parts[1]).toEqual({ text: EXTRACTION_PROMPT });
  });
});

describe('executeAIExtractionLoop', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws an error if extraction finishes with SAFETY reason', async () => {
    const mockGenAI = {
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: null,
          functionCalls: [],
          candidates: [{ finishReason: 'SAFETY' }]
        })
      }
    } as any;

    await expect(executeAIExtractionLoop(mockGenAI, 'test-model', [], {} as any, false, ''))
      .rejects.toThrow('Analysis Failed: The document content was flagged by safety filters.');
  });

  it('throws an error if text is null and no function calls', async () => {
    const mockGenAI = {
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: null,
          functionCalls: [],
          candidates: [{ finishReason: 'STOP' }]
        })
      }
    } as any;

    await expect(executeAIExtractionLoop(mockGenAI, 'test-model', [], {} as any, false, ''))
      .rejects.toThrow('Failed to extract data from document');
  });

  it('executes a tool call and iterates', async () => {
    const mockGenAI = {
      models: {
        generateContent: vi.fn()
          .mockResolvedValueOnce({
            text: null,
            functionCalls: [{ name: 'search_cases', args: { query: 'test' } }],
            candidates: [{ content: { role: 'model', parts: [] } }]
          })
          .mockResolvedValueOnce({
            text: JSON.stringify({ mockData: 'success' }),
            functionCalls: []
          })
      }
    } as any;

    vi.spyOn(gemini, 'callMcpTool').mockResolvedValue({ cases: [] });

    const result = await executeAIExtractionLoop(mockGenAI, 'test-model', [], {} as any, false, '');

    expect(result).toEqual({ mockData: 'success' });
    expect(gemini.callMcpTool).toHaveBeenCalledWith('search_cases', { query: 'test' }, false, '');
    expect(mockGenAI.models.generateContent).toHaveBeenCalledTimes(2);
  });

  it('throws an error if tool call returns an error', async () => {
    const mockGenAI = {
      models: {
        generateContent: vi.fn().mockResolvedValueOnce({
          text: null,
          functionCalls: [{ name: 'search_cases', args: {} }],
          candidates: [{ content: { role: 'model', parts: [] } }]
        })
      }
    } as any;

    vi.spyOn(gemini, 'callMcpTool').mockResolvedValue({ error: 'API limits reached' });

    await expect(executeAIExtractionLoop(mockGenAI, 'test-model', [], {} as any, false, ''))
      .rejects.toThrow('TOOL_ERROR: API limits reached');
  });

  it('handles unknown tool call', async () => {
    const mockGenAI = {
      models: {
        generateContent: vi.fn().mockResolvedValueOnce({
          text: null,
          functionCalls: [{ name: 'unknown_tool', args: {} }],
          candidates: [{ content: { role: 'model', parts: [] } }]
        })
      }
    } as any;

    await expect(executeAIExtractionLoop(mockGenAI, 'test-model', [], {} as any, false, ''))
      .rejects.toThrow('TOOL_ERROR: Unknown tool');
  });

  it('throws error if max iterations reached', async () => {
      const mockGenAI = {
        models: {
          generateContent: vi.fn().mockResolvedValue({
            text: null,
            functionCalls: [{ name: 'search_cases', args: {} }],
            candidates: [{ content: { role: 'model', parts: [] } }]
          })
        }
      } as any;

      vi.spyOn(gemini, 'callMcpTool').mockResolvedValue({ cases: [] });

      await expect(executeAIExtractionLoop(mockGenAI, 'test-model', [], {} as any, false, ''))
        .rejects.toThrow('Analysis stopped: Too many tool calls required');
  });
});

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
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns early if files array is empty', async () => {
    await performAnalysis([], mockFileCache, false, '', mockSetLoading, mockSetError, mockSetAnalysis, mockSetShowLogs);
    expect(mockSetLoading).not.toHaveBeenCalled();
  });

  it('returns cached analysis if hash matches', async () => {
    vi.spyOn(fileUtils, 'hashFile').mockResolvedValue('testhash');
    mockFileCache.current.set('testhash', { riskScore: 50 });

    const mockFile = new File([''], 'test.pdf');
    await performAnalysis([mockFile], mockFileCache, false, '', mockSetLoading, mockSetError, mockSetAnalysis, mockSetShowLogs);

    expect(mockSetAnalysis).toHaveBeenCalledWith({ riskScore: 50 });
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it('handles general errors during execution', async () => {
    vi.spyOn(fileUtils, 'hashFile').mockRejectedValue(new Error('Hash failed'));

    const mockFile = new File([''], 'test.pdf');
    await performAnalysis([mockFile], mockFileCache, false, '', mockSetLoading, mockSetError, mockSetAnalysis, mockSetShowLogs);

    expect(mockSetError).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Analysis Failed',
      details: 'Hash failed'
    }));
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it('handles authentication API errors', async () => {
    vi.spyOn(fileUtils, 'hashFile').mockRejectedValue(new Error('API_KEY missing'));

    const mockFile = new File([''], 'test.pdf');
    await performAnalysis([mockFile], mockFileCache, false, '', mockSetLoading, mockSetError, mockSetAnalysis, mockSetShowLogs);

    expect(mockSetError).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Authentication Error'
    }));
  });

  it('handles parsing JSON errors', async () => {
    vi.spyOn(fileUtils, 'hashFile').mockRejectedValue(new Error('Invalid JSON format'));

    const mockFile = new File([''], 'test.pdf');
    await performAnalysis([mockFile], mockFileCache, false, '', mockSetLoading, mockSetError, mockSetAnalysis, mockSetShowLogs);

    expect(mockSetError).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Data Parsing Error'
    }));
  });

  it('handles network fetch errors', async () => {
    vi.spyOn(fileUtils, 'hashFile').mockRejectedValue(new Error('fetch failed'));

    const mockFile = new File([''], 'test.pdf');
    await performAnalysis([mockFile], mockFileCache, false, '', mockSetLoading, mockSetError, mockSetAnalysis, mockSetShowLogs);

    expect(mockSetError).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Network Error'
    }));
  });

  it('handles Tool errors', async () => {
    vi.spyOn(fileUtils, 'hashFile').mockRejectedValue(new Error('TOOL_ERROR: limits'));

    const mockFile = new File([''], 'test.pdf');
    await performAnalysis([mockFile], mockFileCache, false, '', mockSetLoading, mockSetError, mockSetAnalysis, mockSetShowLogs);

    expect(mockSetError).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Integration Tool Error'
    }));
  });

  it('handles File errors', async () => {
    vi.spyOn(fileUtils, 'hashFile').mockRejectedValue(new Error('FILE_ERROR: corruption'));

    const mockFile = new File([''], 'test.pdf');
    await performAnalysis([mockFile], mockFileCache, false, '', mockSetLoading, mockSetError, mockSetAnalysis, mockSetShowLogs);

    expect(mockSetError).toHaveBeenCalledWith(expect.objectContaining({
      message: 'File Processing Error'
    }));
  });
});
