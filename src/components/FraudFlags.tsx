import React from 'react';
import { CreditAnalysis } from '../types';
import { AlertTriangle } from 'lucide-react';

interface FraudFlagsProps {
  analysis: CreditAnalysis;
}

export function FraudFlags({ analysis }: FraudFlagsProps) {
  if (analysis.fraudFlags.length === 0) return null;

  return (
    <div className="lg:col-span-12 border border-rose-900 bg-rose-950/10 p-3 mt-2">
      <div className="text-xs uppercase text-rose-500 border-b border-rose-900/50 pb-1 mb-2 flex items-center gap-2">
        <AlertTriangle className="w-3 h-3" />
        <span>Critical Risk Flags Detected</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {analysis.fraudFlags.map((flag, index) => (
          <div key={index} className="flex items-start gap-2 text-xs text-rose-400 bg-rose-950/30 p-2 border border-rose-900/50">
            <span className="text-rose-500 font-bold">!</span>
            <span>{flag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
