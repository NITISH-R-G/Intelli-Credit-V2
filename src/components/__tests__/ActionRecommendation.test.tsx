import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi, describe, it, expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { ActionRecommendation } from '../ActionRecommendation';
import { CreditAnalysis } from '../../types';

vi.mock('lucide-react', () => ({
  FileWarning: () => <div data-testid="file-warning-icon" />,
  CheckCircle2: () => <div data-testid="check-circle-icon" />
}));

describe('ActionRecommendation', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const mockAnalysisBase: CreditAnalysis = {
    missingData: [],
    requiredDocs: [],
    recommendation: 'Approve with Conditions',
    explanation: 'Solid financials, but missing some recent statements.'
  } as unknown as CreditAnalysis;

  it('renders correctly with no missing data or required docs', () => {
    render(<ActionRecommendation analysis={mockAnalysisBase} />);

    expect(screen.getByText('Action Required')).toBeInTheDocument();
    expect(screen.getByTestId('file-warning-icon')).toBeInTheDocument();
    expect(screen.getByText('All required data present.')).toBeInTheDocument();
    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();

    expect(screen.getByText('Final Recommendation')).toBeInTheDocument();
    expect(screen.getByText('Approve with Conditions')).toBeInTheDocument();
    expect(screen.getByText('Solid financials, but missing some recent statements.')).toBeInTheDocument();
  });

  it('renders missing data correctly', () => {
    const analysisWithMissingData = {
      ...mockAnalysisBase,
      missingData: ['Q3 Financials', 'Board Resolution']
    } as unknown as CreditAnalysis;

    render(<ActionRecommendation analysis={analysisWithMissingData} />);

    expect(screen.getByText('Missing Critical Data')).toBeInTheDocument();
    expect(screen.getByText('Q3 Financials')).toBeInTheDocument();
    expect(screen.getByText('Board Resolution')).toBeInTheDocument();
    expect(screen.queryByText('All required data present.')).not.toBeInTheDocument();
  });

  it('renders required documents correctly', () => {
    const analysisWithRequiredDocs = {
      ...mockAnalysisBase,
      requiredDocs: ['Tax Returns', 'ID Proof']
    } as unknown as CreditAnalysis;

    render(<ActionRecommendation analysis={analysisWithRequiredDocs} />);

    expect(screen.getByText('Required Documents')).toBeInTheDocument();
    expect(screen.getByText('Tax Returns')).toBeInTheDocument();
    expect(screen.getByText('ID Proof')).toBeInTheDocument();
    expect(screen.queryByText('All required data present.')).not.toBeInTheDocument();
  });

  it('renders different colors based on recommendation (Reject)', () => {
    const rejectedAnalysis = {
      ...mockAnalysisBase,
      recommendation: 'Reject due to high risk'
    } as unknown as CreditAnalysis;

    render(<ActionRecommendation analysis={rejectedAnalysis} />);
    const recElement = screen.getByText('Reject due to high risk');
    expect(recElement).toHaveClass('text-rose-500');
  });
});
