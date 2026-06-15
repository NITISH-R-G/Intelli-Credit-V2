import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { IntelligenceRow } from '../IntelligenceRow';
import { CreditAnalysis } from '../../types';
import '@testing-library/jest-dom/vitest';

const mockAnalysis = {
  externalIntelligence: {
    mcaStatus: 'Active',
    legalDisputes: ['Dispute 1', 'Dispute 2'],
    newsSectorTrends: ['Trend 1', 'Trend 2'],
  },
  unstructuredInsights: {
    ratingAgencyReports: 'Good standing',
    shareholdingPattern: 'Stable',
    boardMeetingNotes: ['Note 1', 'Note 2'],
  },
  primaryInsights: {
    siteVisitObservations: ['Observation 1', 'Observation 2'],
    managementInterviews: ['Interview 1', 'Interview 2'],
  },
} as unknown as CreditAnalysis;

describe('IntelligenceRow', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders external intelligence data correctly', () => {
    render(<IntelligenceRow analysis={mockAnalysis} />);

    expect(screen.getByText('External Intelligence (Live Web)')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Dispute 1')).toBeInTheDocument();
    expect(screen.getByText('Trend 2')).toBeInTheDocument();
  });

  it('renders unstructured insights data correctly', () => {
    render(<IntelligenceRow analysis={mockAnalysis} />);

    expect(screen.getByText('Unstructured Insights')).toBeInTheDocument();
    expect(screen.getByText('Good standing')).toBeInTheDocument();
    expect(screen.getByText('Stable')).toBeInTheDocument();
    expect(screen.getByText('Note 1')).toBeInTheDocument();
  });

  it('renders primary insights data correctly', () => {
    render(<IntelligenceRow analysis={mockAnalysis} />);

    expect(screen.getByText('Primary Insights (Due Diligence)')).toBeInTheDocument();
    expect(screen.getByText('Observation 2')).toBeInTheDocument();
    expect(screen.getByText('Interview 1')).toBeInTheDocument();
  });
});
