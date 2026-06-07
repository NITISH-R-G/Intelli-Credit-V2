import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi, describe, it, expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { FraudFlags } from '../FraudFlags';
import { CreditAnalysis } from '../../types';

vi.mock('lucide-react', () => ({
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
}));

describe('FraudFlags', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders nothing when there are no fraud flags', () => {
    const analysisWithoutFlags = {
      fraudFlags: [],
    } as unknown as CreditAnalysis;

    const { container } = render(<FraudFlags analysis={analysisWithoutFlags} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders fraud flags correctly', () => {
    const analysisWithFlags = {
      fraudFlags: ['Suspicious Activity', 'Unverified Identity'],
    } as unknown as CreditAnalysis;

    render(<FraudFlags analysis={analysisWithFlags} />);

    expect(screen.getByText('Critical Risk Flags Detected')).toBeInTheDocument();
    expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();

    expect(screen.getByText('Suspicious Activity')).toBeInTheDocument();
    expect(screen.getByText('Unverified Identity')).toBeInTheDocument();
    expect(screen.getAllByText('!')).toHaveLength(2);
  });
});
