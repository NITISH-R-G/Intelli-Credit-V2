
import "@testing-library/jest-dom/vitest";
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StressTestingModule from '../StressTestingModule';
import { CreditAnalysis } from '../../types';

describe('StressTestingModule', () => {
  const mockAnalysis = {
    riskGrade: 'B',
  } as CreditAnalysis;

  const mockDisplayAnalysis = {
    riskGrade: 'C',
    ratios: {
      dscr: 1.25,
      icr: 2.50,
    }
  } as CreditAnalysis;

  it('renders correctly and responds to input changes', () => {
    const setRevenueShockMock = vi.fn();
    const setInterestRateShockMock = vi.fn();

    render(
      <StressTestingModule
        revenueShock={-10}
        setRevenueShock={setRevenueShockMock}
        interestRateShock={2}
        setInterestRateShock={setInterestRateShockMock}
        analysis={mockAnalysis}
        displayAnalysis={mockDisplayAnalysis}
      />
    );

    expect(screen.getByText('Revenue Shock (-10%)')).toBeInTheDocument();
    expect(screen.getByText('Interest Rate Shock (2%)')).toBeInTheDocument();

    expect(screen.getByText('B')).toBeInTheDocument(); // Baseline risk grade
    expect(screen.getByText('C')).toBeInTheDocument(); // Stressed risk grade
    expect(screen.getByText('1.25')).toBeInTheDocument(); // Stressed DSCR
    expect(screen.getByText('2.50')).toBeInTheDocument(); // Stressed ICR

    const revenueSlider = screen.getAllByRole('slider')[0];
    fireEvent.change(revenueSlider, { target: { value: '-20' } });
    expect(setRevenueShockMock).toHaveBeenCalledWith(-20);

    const interestSlider = screen.getAllByRole('slider')[1];
    fireEvent.change(interestSlider, { target: { value: '3' } });
    expect(setInterestRateShockMock).toHaveBeenCalledWith(3);
  });
});