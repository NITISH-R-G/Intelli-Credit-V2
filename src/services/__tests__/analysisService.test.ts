import { describe, it, expect } from 'vitest';
import { calculateDisplayAnalysis } from '../analysisService';
import { CreditAnalysis } from '../../types';

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
