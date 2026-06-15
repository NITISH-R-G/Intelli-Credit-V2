import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RiskScorePanel } from '../RiskScorePanel';
import { CreditAnalysis } from '../../types';

describe('RiskScorePanel', () => {
  it('renders low risk correctly (green)', () => {
    const lowRiskAnalysis = {
      riskGrade: 'A',
      riskScore: 85,
      riskLevel: 'Low',
    } as CreditAnalysis;

    const { container } = render(<RiskScorePanel displayAnalysis={lowRiskAnalysis} />);

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('Low RISK')).toBeInTheDocument();

    const scoreElement = screen.getByText('85');
    expect(scoreElement.className).toContain('text-emerald-500');
  });

  it('renders medium risk correctly (amber)', () => {
    const mediumRiskAnalysis = {
      riskGrade: 'B',
      riskScore: 55,
      riskLevel: 'Medium',
    } as CreditAnalysis;

    render(<RiskScorePanel displayAnalysis={mediumRiskAnalysis} />);

    const scoreElement = screen.getByText('55');
    expect(scoreElement.className).toContain('text-amber-500');
  });

  it('renders high risk correctly (rose)', () => {
    const highRiskAnalysis = {
      riskGrade: 'C',
      riskScore: 30,
      riskLevel: 'High',
    } as CreditAnalysis;

    render(<RiskScorePanel displayAnalysis={highRiskAnalysis} />);

    const scoreElement = screen.getByText('30');
    expect(scoreElement.className).toContain('text-rose-500');
  });
});
