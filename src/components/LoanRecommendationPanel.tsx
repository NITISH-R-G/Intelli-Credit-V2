import React from 'react';
import { CreditAnalysis } from '../types';

interface LoanRecommendationPanelProps {
  displayAnalysis: CreditAnalysis;
}

export const LoanRecommendationPanel = ({ displayAnalysis }: LoanRecommendationPanelProps) => {
  return (
    <div className="border border-zinc-800 bg-[#0a0a0a] p-3 flex flex-col justify-between">
      <div className="text-xs uppercase text-zinc-500 border-b border-zinc-800 pb-1 mb-2">
        Loan Recommendation
      </div>
      <div className="flex items-end justify-between">
        <div className={`text-3xl font-light ${
          displayAnalysis.recommendation.includes('Approve') ? 'text-emerald-500' :
          displayAnalysis.recommendation.includes('Reject') ? 'text-rose-500' : 'text-amber-500'
        }`}>
          {displayAnalysis.suggestedLoanAmount}
        </div>
        <div className="text-right">
          <div className="text-zinc-400 text-xs uppercase">Rate: {displayAnalysis.suggestedInterestRate}</div>
          <div className="text-zinc-500 text-xs uppercase tracking-tighter">Confidence: {displayAnalysis.decisionConfidence}%</div>
        </div>
      </div>
    </div>
  );
};
