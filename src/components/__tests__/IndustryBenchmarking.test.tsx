import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { IndustryBenchmarking } from '../IndustryBenchmarking';
import { CreditAnalysis } from '../../types';

describe('IndustryBenchmarking', () => {
  afterEach(() => {
    cleanup();
  });

  const mockAnalysis: CreditAnalysis = {
    companyInfo: {
      name: 'Test Corp',
      establishedYear: 2020,
      industry: 'Technology',
      registrationNumber: '123',
      employees: 50,
    },
    structuredData: {
      revenue: [{ year: '2023', value: 200 }],
      profit: [{ year: '2023', value: 20 }],
      debt: [{ year: '2023', value: 30 }],
      cashflow: [{ year: '2023', value: 50 }],
      assets: [{ year: '2023', value: 300 }],
      liabilities: [{ year: '2023', value: 100 }],
    },
    unstructuredInsights: {
      boardMeetingNotes: ['note1'],
      ratingAgencyReports: 'report1',
      shareholdingPattern: 'pattern1',
    },
    primaryInsights: {
      siteVisitObservations: [],
      managementInterviews: [],
    },
    fiveCs: {
      character: { score: 80, insights: ['Strong history.'], redFlags: [], positiveSignals: [] },
      capacity: { score: 90, insights: ['High cashflow.'], redFlags: [], positiveSignals: [] },
      capital: { score: 70, insights: ['Good reserves.'], redFlags: [], positiveSignals: [] },
      collateral: { score: 80, insights: ['Solid assets.'], redFlags: [], positiveSignals: [] },
      conditions: { score: 70, insights: ['Stable market.'], redFlags: [], positiveSignals: [] },
    },
    fraudDetection: [],
    fraudFlags: [],
    verificationLayer: [],
    externalIntelligence: { mcaStatus: 'Active', legalDisputes: [], newsSectorTrends: [] },
    camMarkdown: '',
    riskAnalysisDetails: {
      financialRisk: '',
      legalRisk: '',
      behavioralRisk: '',
      industryRisk: '',
      managementRisk: '',
    },
    ratios: { debtToIncome: 0.5, profitMargin: 0.15, currentRatio: 1.8 },
    riskScore: 50,
    riskLevel: 'Medium',
    explanation: '',
    riskGrade: 'B',
    missingData: [],
    requiredDocs: [],
    decisionConfidence: 85,
    suggestedLoanAmount: '1,000,000',
    suggestedInterestRate: '10.5%',
    recommendation: 'Approve',
  };

  it('renders Industry Benchmarking correctly', () => {
    render(<IndustryBenchmarking analysis={mockAnalysis} />);
    expect(screen.getByText('Industry Benchmarking (Technology)')).toBeInTheDocument();
    expect(screen.getByText('Current Ratio')).toBeInTheDocument();
    expect(screen.getByText('Profit Margin')).toBeInTheDocument();
    expect(screen.getByText('Leverage (DTI)')).toBeInTheDocument();
  });
});
