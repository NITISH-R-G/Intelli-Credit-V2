import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { DecisionPanel } from '../DecisionPanel';
import { CreditAnalysis } from '../../types';

describe('DecisionPanel', () => {
  afterEach(() => {
    cleanup();
  });

  const mockAnalysis: CreditAnalysis = {
    companyInfo: {
      name: 'Test Corp',
      establishedYear: 2020,
      industry: 'Tech',
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
      character: { score: 80, insights: [], redFlags: [], positiveSignals: [] },
      capacity: { score: 90, insights: [], redFlags: [], positiveSignals: [] },
      capital: { score: 70, insights: [], redFlags: [], positiveSignals: [] },
      collateral: { score: 80, insights: [], redFlags: [], positiveSignals: [] },
      conditions: { score: 70, insights: [], redFlags: [], positiveSignals: [] },
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
    ratios: { debtToIncome: 0.5, profitMargin: 0.1, currentRatio: 1.5 },
    riskScore: 50,
    riskLevel: 'Medium',
    explanation: '',
    riskGrade: 'B',
    missingData: [],
    requiredDocs: [],
    decisionConfidence: 85,
    suggestedLoanAmount: '₹ 1,000,000',
    suggestedInterestRate: '10.5%',
    recommendation: 'Approve',
  };

  it('renders DecisionPanel with approval correctly', () => {
    render(<DecisionPanel displayAnalysis={mockAnalysis} />);
    expect(screen.getByText('Loan Recommendation')).toBeInTheDocument();
    expect(screen.getByText('₹ 1,000,000')).toBeInTheDocument();
    expect(screen.getByText('Rate: 10.5%')).toBeInTheDocument();
    expect(screen.getByText('Confidence: 85%')).toBeInTheDocument();
  });

  it('renders DecisionPanel with rejection correctly', () => {
    const rejectionAnalysis = {
      ...mockAnalysis,
      recommendation: 'Reject',
      suggestedLoanAmount: '₹ 0',
      decisionConfidence: 95,
    };
    render(<DecisionPanel displayAnalysis={rejectionAnalysis} />);
    expect(screen.getByText('₹ 0')).toBeInTheDocument();
    expect(screen.getByText('Confidence: 95%')).toBeInTheDocument();
  });

  it('renders DecisionPanel with referral correctly', () => {
    const referAnalysis = {
      ...mockAnalysis,
      recommendation: 'Refer for Review',
      suggestedLoanAmount: '₹ 500,000',
      decisionConfidence: 60,
    };
    render(<DecisionPanel displayAnalysis={referAnalysis} />);
    expect(screen.getByText('₹ 500,000')).toBeInTheDocument();
    expect(screen.getByText('Confidence: 60%')).toBeInTheDocument();
    expect(screen.getByText('₹ 500,000')).toHaveClass('text-amber-500');
  });
});
