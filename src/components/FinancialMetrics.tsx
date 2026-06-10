import React from 'react';
import { CreditAnalysis } from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface FinancialMetricsProps {
  analysis: CreditAnalysis;
}

export const FinancialMetrics = ({ analysis }: FinancialMetricsProps) => {
  return (
    <div className="lg:col-span-1 border border-zinc-800 bg-[#0a0a0a] p-3">
      <div className="text-xs uppercase text-zinc-500 border-b border-zinc-800 pb-1 mb-2 flex justify-between">
        <span>Financial Metrics (3-Year Trend)</span>
        <span className="text-zinc-600">INR (₹)</span>
      </div>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={analysis.structuredData.revenue.map((r, i) => ({
              year: r.year,
              Revenue: r.value,
              Profit: analysis.structuredData.profit[i].value,
              Debt: analysis.structuredData.debt[i].value,
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="year" stroke="#71717a" fontSize={10} />
            <YAxis stroke="#71717a" fontSize={10} />
            <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #27272a' }} />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            <Line type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="Profit" stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="Debt" stroke="#ef4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
