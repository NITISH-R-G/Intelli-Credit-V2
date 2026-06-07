import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { FiveCsAnalysis } from '../FiveCsAnalysis';
import { CreditAnalysis } from '../../types';

describe('FiveCsAnalysis', () => {
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
      character: {
        score: 80,
        insights: ['Strong history.'],
        redFlags: [],
        positiveSignals: ['Good rep'],
      },
      capacity: { score: 90, insights: ['High cashflow.'], redFlags: [], positiveSignals: [] },
      capital: { score: 70, insights: ['Good reserves.'], redFlags: [], positiveSignals: [] },
      collateral: {
        score: 80,
        insights: ['Solid assets.'],
        redFlags: [],
        positiveSignals: [],
        assets: [
          {
            type: 'Land',
            marketValue: 100000000,
            estimatedValue: 80000000,
            ltvRatio: 0.8,
            remarks: 'Good',
          },
        ],
      },
      conditions: {
        score: 70,
        insights: ['Stable market.'],
        redFlags: ['Recession risk'],
        positiveSignals: [],
      },
    },
    fraudDetection: [
      {
        category: 'Identity',
        indicator: 'Mismatched Director PAN',
        status: 'Fail',
        details: 'PAN does not match MCA records.',
        evidence: 'MCA Database',
      },
    ],
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
    suggestedLoanAmount: '1,000,000',
    suggestedInterestRate: '10.5%',
    recommendation: 'Approve',
  };

  it('renders Five Cs correctly', () => {
    render(<FiveCsAnalysis analysis={mockAnalysis} displayAnalysis={mockAnalysis} />);
    expect(screen.getByText('Character')).toBeInTheDocument();
    expect(screen.getByText('Capacity')).toBeInTheDocument();
    expect(screen.getByText('Capital')).toBeInTheDocument();
    expect(screen.getByText('Collateral')).toBeInTheDocument();
    expect(screen.getByText('Conditions')).toBeInTheDocument();
  });

  it('renders positive signals', () => {
    render(<FiveCsAnalysis analysis={mockAnalysis} displayAnalysis={mockAnalysis} />);
    expect(screen.getByText('Good rep')).toBeInTheDocument();
  });

  it('renders red flags', () => {
    render(<FiveCsAnalysis analysis={mockAnalysis} displayAnalysis={mockAnalysis} />);
    expect(screen.getByText('Recession risk')).toBeInTheDocument();
  });

  it('renders collateral assets', () => {
    render(<FiveCsAnalysis analysis={mockAnalysis} displayAnalysis={mockAnalysis} />);
    expect(screen.getByText('Land')).toBeInTheDocument();
    expect(screen.getByText('80% LTV')).toBeInTheDocument();
  });

  it('renders fraud detection flags for Character', () => {
    const analysisWithFraud = {
      ...mockAnalysis,
      fiveCs: {
        ...mockAnalysis.fiveCs,
        character: {
          ...mockAnalysis.fiveCs.character,
          redFlags: ['Some flag'],
        },
      },
    };
    render(<FiveCsAnalysis analysis={analysisWithFraud} displayAnalysis={analysisWithFraud} />);
    expect(screen.getByText('FRAUD: Mismatched Director PAN')).toBeInTheDocument();
  });
});
