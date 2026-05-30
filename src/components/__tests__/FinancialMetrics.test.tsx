import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { FinancialMetrics } from '../FinancialMetrics';
import { CreditAnalysis } from '../../types';

// Mock Recharts components because they use SVG features that jsdom might not fully support
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: ({ children, data }: { children: React.ReactNode, data: any[] }) => (
    <div data-testid="line-chart" data-points={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

const mockAnalysis: CreditAnalysis = {
  companyName: "Test Company",
  overallRiskScore: 50,
  overallRiskLevel: "Medium",
  executiveSummary: "A summary",
  keyFindings: ["Finding 1"],
  structuredData: {
    revenue: [{ year: "2021", value: 100 }, { year: "2022", value: 120 }],
    profit: [{ year: "2021", value: 20 }, { year: "2022", value: 25 }],
    debt: [{ year: "2021", value: 50 }, { year: "2022", value: 45 }],
    cashflow: [{ year: "2021", value: 10 }, { year: "2022", value: 15 }]
  },
  verificationLayer: [],
  fraudFlags: [],
  financialRatios: { dscr: 1.5, currentRatio: 2.0, debtToEquity: 1.0 },
  fiveCs: {
    character: { score: 80, notes: "Good" },
    capacity: { score: 75, notes: "Good" },
    capital: { score: 85, notes: "Good" },
    collateral: { score: 60, notes: "Okay" },
    conditions: { score: 70, notes: "Good" }
  },
  suggestedLoanAmount: "₹ 1,00,000",
  suggestedInterestRate: "10%",
  decisionConfidence: 85,
  recommendation: "Approve"
};

describe('FinancialMetrics', () => {
  it('renders correctly', () => {
    render(<FinancialMetrics analysis={mockAnalysis} />);

    expect(screen.getByText('Financial Metrics (3-Year Trend)')).toBeInTheDocument();
    expect(screen.getByText('INR (₹)')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();

    // Check if data is passed to LineChart correctly
    const chart = screen.getByTestId('line-chart');
    const dataPointsStr = chart.getAttribute('data-points');
    expect(dataPointsStr).toBeTruthy();

    if (dataPointsStr) {
      const dataPoints = JSON.parse(dataPointsStr);
      expect(dataPoints.length).toBe(2);
      expect(dataPoints[0].year).toBe('2021');
      expect(dataPoints[0].Revenue).toBe(100);
      expect(dataPoints[0].Profit).toBe(20);
      expect(dataPoints[0].Debt).toBe(50);
    }
  });
});