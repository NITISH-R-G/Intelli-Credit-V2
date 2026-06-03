import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi, describe, it, expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { RiskDimensions } from '../RiskDimensions';
import { CreditAnalysis } from '../../types';

vi.mock('lucide-react', () => ({
  TrendingDown: () => <div data-testid="trending-down-icon" />,
  Scale: () => <div data-testid="scale-icon" />,
  Activity: () => <div data-testid="activity-icon" />,
  Building2: () => <div data-testid="building-icon" />,
  Users: () => <div data-testid="users-icon" />,
  ShieldAlert: () => <div data-testid="shield-alert-icon" />
}));

describe('RiskDimensions', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const mockAnalysis: CreditAnalysis = {
    riskAnalysisDetails: {
      financialRisk: 'High Debt',
      legalRisk: 'Pending Lawsuits',
      behavioralRisk: 'Late Payments',
      industryRisk: 'Cyclical Downturn',
      managementRisk: 'Inexperienced Team'
    },
    fraudDetection: [
      { status: 'Pass' },
      { status: 'Fail' }
    ]
  } as unknown as CreditAnalysis;

  it('renders risk dimensions correctly', () => {
    render(<RiskDimensions analysis={mockAnalysis} />);

    expect(screen.getByText('Risk Dimensions Analysis')).toBeInTheDocument();

    expect(screen.getByText('Financial Risk')).toBeInTheDocument();
    expect(screen.getByText('High Debt')).toBeInTheDocument();

    expect(screen.getByText('Legal Risk')).toBeInTheDocument();
    expect(screen.getByText('Pending Lawsuits')).toBeInTheDocument();

    expect(screen.getByText('Behavioral Risk')).toBeInTheDocument();
    expect(screen.getByText('Late Payments')).toBeInTheDocument();

    expect(screen.getByText('Industry Risk')).toBeInTheDocument();
    expect(screen.getByText('Cyclical Downturn')).toBeInTheDocument();

    expect(screen.getByText('Management Risk')).toBeInTheDocument();
    expect(screen.getByText('Inexperienced Team')).toBeInTheDocument();
  });

  it('renders forensic fraud risk when there are failed checks', () => {
    render(<RiskDimensions analysis={mockAnalysis} />);

    expect(screen.getByText('Forensic Fraud Risk')).toBeInTheDocument();
    expect(screen.getByText(/Detected 1 critical flags and 0 warnings in forensic checks./)).toBeInTheDocument();
    expect(screen.getByTestId('shield-alert-icon')).toBeInTheDocument();
  });

  it('does not render forensic fraud risk when all checks pass', () => {
    const passedAnalysis = {
      ...mockAnalysis,
      fraudDetection: [{ status: 'Pass' }, { status: 'Pass' }]
    } as unknown as CreditAnalysis;

    render(<RiskDimensions analysis={passedAnalysis} />);

    expect(screen.queryByText('Forensic Fraud Risk')).not.toBeInTheDocument();
  });
});
