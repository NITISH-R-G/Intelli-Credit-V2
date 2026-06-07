import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { VerificationEngine } from '../VerificationEngine';
import { CreditAnalysis } from '../../types';

describe('VerificationEngine', () => {
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
      revenue: [
        { year: '2021', value: 100 },
        { year: '2022', value: 150 },
        { year: '2023', value: 200 },
      ],
      profit: [
        { year: '2021', value: 10 },
        { year: '2022', value: 15 },
        { year: '2023', value: 20 },
      ],
      debt: [
        { year: '2021', value: 50 },
        { year: '2022', value: 40 },
        { year: '2023', value: 30 },
      ],
      cashflow: [{ year: '2023', value: 50 }],
      assets: [{ year: '2023', value: 300 }],
      liabilities: [{ year: '2023', value: 100 }],
    },
    unstructuredInsights: {
      boardMeetingNotes: ['note1'],
      ratingAgencyReports: 'report1',
      shareholdingPattern: 'pattern1',
    },
    fiveCs: {
      character: { score: 8, insights: ['Strong history.'], redFlags: [], positiveSignals: [] },
      capacity: { score: 9, insights: ['High cashflow.'], redFlags: [], positiveSignals: [] },
      capital: { score: 7, insights: ['Good reserves.'], redFlags: [], positiveSignals: [] },
      collateral: { score: 8, insights: ['Solid assets.'], redFlags: [], positiveSignals: [] },
      conditions: { score: 7, insights: ['Stable market.'], redFlags: [], positiveSignals: [] },
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
    verificationLayer: [
      {
        category: 'Financials',
        dataPoint: 'Revenue',
        source: 'ITR',
        status: 'Verified',
        confidenceScore: 95,
        notes: '',
      },
    ],
    shellCompanyAnalysis: {
      isPotentialShell: true,
      riskLevel: 'High',
      employeeCount: 5,
      officeType: 'Virtual',
      operationalEvidence: ['No website', 'No physical office'],
      indicators: [
        {
          name: 'Zero Revenue',
          status: 'Fail',
          details: 'No revenue reported.',
          evidence: 'GST returns',
        },
      ],
    },
    directorShareholderHistory: {
      hasRapidChanges: true,
      riskLevel: 'Medium',
      summary: 'Frequent changes in directorship.',
      events: [
        {
          date: '2023-01-01',
          type: 'Resignation',
          description: 'Director A resigned.',
          evidence: 'DIR-12',
          reason: 'Personal',
        },
      ],
    },
    externalIntelligence: {
      mcaStatus: 'Active',
      legalDisputes: ['Case 1'],
      newsSectorTrends: ['Trend 1'],
    },
    decisionConfidence: 85,
    suggestedLoanAmount: '1,000,000',
    primaryInsights: { siteVisitObservations: [], managementInterviews: [] },
    suggestedInterestRate: '10.5%',
    recommendation: 'Approve',
    camMarkdown: '',
    riskAnalysisDetails: {
      financialRisk: '',
      legalRisk: '',
      behavioralRisk: '',
      industryRisk: '',
      managementRisk: '',
    },
    ratios: { debtToIncome: 0, profitMargin: 0, currentRatio: 0 },
    riskScore: 50,
    riskLevel: 'Medium',
    explanation: '',
    riskGrade: 'B',
    fraudFlags: [],
    missingData: [],
    requiredDocs: [],
  };

  it('renders Trust Engine Verification Log correctly', () => {
    render(<VerificationEngine analysis={mockAnalysis} />);
    expect(screen.getByText('Trust Engine Verification Log')).toBeInTheDocument();
    expect(screen.getByText('Financials')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('renders Critical Shell Company Risk when isPotentialShell is true', () => {
    render(<VerificationEngine analysis={mockAnalysis} />);
    expect(screen.getByText('Critical Shell Company Risk')).toBeInTheDocument();
  });

  it('renders Fraud Detection Indicators', () => {
    render(<VerificationEngine analysis={mockAnalysis} />);
    expect(screen.getByText('Mismatched Director PAN')).toBeInTheDocument();
  });

  it('renders Director & Shareholder History', () => {
    render(<VerificationEngine analysis={mockAnalysis} />);
    expect(screen.getByText('Director & Shareholder History')).toBeInTheDocument();
    expect(screen.getByText('Director A resigned.')).toBeInTheDocument();
  });

  it('does not render Critical Shell Company Risk when isPotentialShell is false', () => {
    const safeAnalysis = {
      ...mockAnalysis,
      shellCompanyAnalysis: {
        ...mockAnalysis.shellCompanyAnalysis!,
        isPotentialShell: false,
      },
    };
    render(<VerificationEngine analysis={safeAnalysis} />);
    expect(screen.queryByText('Critical Shell Company Risk')).not.toBeInTheDocument();
  });
});
