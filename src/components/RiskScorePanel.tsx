import React from 'react';
import { CreditAnalysis } from '../types';

export const RiskScorePanel = ({ displayAnalysis }: { displayAnalysis: CreditAnalysis }) => {
  return (
    <div className="border border-zinc-800 bg-[#0a0a0a] p-3 flex flex-col justify-between">
      <div className="text-xs uppercase text-zinc-500 border-b border-zinc-800 pb-1 mb-2 flex justify-between">
        <span>Risk Grade</span>
        <span className="text-amber-500">{displayAnalysis.riskGrade}</span>
      </div>
      <div className="flex items-end justify-between">
        <div className={`text-5xl font-light ${
          displayAnalysis.riskScore >= 70 ? 'text-emerald-500' :
          displayAnalysis.riskScore >= 40 ? 'text-amber-500' : 'text-rose-500'
        }`}>
          {displayAnalysis.riskScore}
        </div>
        <div className="text-right">
          <div className={`text-lg uppercase tracking-widest ${
            displayAnalysis.riskLevel === 'Low' ? 'text-emerald-500' :
            displayAnalysis.riskLevel === 'Medium' ? 'text-amber-500' : 'text-rose-500'
          }`}>
            {displayAnalysis.riskLevel} RISK
          </div>
          <div className="text-zinc-500 text-xs">OUT OF 100</div>
        </div>
      </div>
    </div>
  );
};
