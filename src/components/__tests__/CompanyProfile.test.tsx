
import "@testing-library/jest-dom/vitest";
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CompanyProfile } from '../CompanyProfile';
import { CreditAnalysis } from '../../types';

const mockAnalysis = {
  companyInfo: {
    registrationNumber: 'REG12345',
    name: 'Tech Innovators Inc',
    establishedYear: '2010',
    industry: 'Software',
    employees: '250',
  },
} as CreditAnalysis;

describe('CompanyProfile', () => {
  it('renders company information correctly', () => {
    render(<CompanyProfile analysis={mockAnalysis} />);

    expect(screen.getByText('ID: REG12345')).toBeInTheDocument();
    expect(screen.getByText('Tech Innovators Inc')).toBeInTheDocument();
    expect(screen.getByText('2010')).toBeInTheDocument();
    expect(screen.getByText('Software')).toBeInTheDocument();
    expect(screen.getByText('250')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });
});