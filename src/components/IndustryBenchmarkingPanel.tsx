import React from 'react';
import { CreditAnalysis } from '../types';
import { INDUSTRY_BENCHMARKS } from '../constants';

interface IndustryBenchmarkingPanelProps {
  analysis: CreditAnalysis;
}

export const IndustryBenchmarkingPanel = ({ analysis }: IndustryBenchmarkingPanelProps) => {
  return (
    <div className="lg:col-span-12 border border-zinc-800 bg-[#0a0a0a] p-4">
      <div className="text-xs uppercase text-zinc-500 border-b border-zinc-800 pb-2 mb-4 flex justify-between">
        <span>Industry Benchmarking ({analysis.companyInfo.industry})</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Current Ratio', value: analysis.ratios.currentRatio, benchmark: INDUSTRY_BENCHMARKS[analysis.companyInfo.industry]?.currentRatio || 1.5 },
          { label: 'Profit Margin', value: analysis.ratios.profitMargin, benchmark: INDUSTRY_BENCHMARKS[analysis.companyInfo.industry]?.profitMargin || 0.1 },
          { label: 'Leverage (DTI)', value: analysis.ratios.debtToIncome, benchmark: INDUSTRY_BENCHMARKS[analysis.companyInfo.industry]?.debtToEquity || 1.0 },
        ].map((item, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-xs text-zinc-400 cursor-help" title={`Company: ${item.value.toFixed(2)} | Benchmark: ${item.benchmark.toFixed(2)}`}>
              <span>{item.label}</span>
              <span>{item.value.toFixed(2)} / {item.benchmark.toFixed(2)}</span>
            </div>
            <div className="w-full bg-zinc-800 h-2 cursor-help" title={`Company: ${item.value.toFixed(2)} | Benchmark: ${item.benchmark.toFixed(2)}`}>
              <div className="bg-amber-500 h-2 transition-all duration-500" style={{ width: `${Math.min((item.value / (item.benchmark * 2)) * 100, 100)}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
