import React from 'react';
import { CreditAnalysis } from '../types';
import { TrendingDown, Scale, Activity, Building2, Users, ShieldAlert } from 'lucide-react';

interface RiskDimensionsProps {
  analysis: CreditAnalysis;
}

export function RiskDimensions({ analysis }: RiskDimensionsProps) {
  return (
    <div className="lg:col-span-2 border border-zinc-800 bg-[#0a0a0a] p-3">
      <div className="text-xs uppercase text-zinc-500 border-b border-zinc-800 pb-1 mb-3">
        Risk Dimensions Analysis
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: 'Financial Risk', value: analysis.riskAnalysisDetails.financialRisk, icon: TrendingDown },
          { label: 'Legal Risk', value: analysis.riskAnalysisDetails.legalRisk, icon: Scale },
          { label: 'Behavioral Risk', value: analysis.riskAnalysisDetails.behavioralRisk, icon: Activity },
          { label: 'Industry Risk', value: analysis.riskAnalysisDetails.industryRisk, icon: Building2 },
          { label: 'Management Risk', value: analysis.riskAnalysisDetails.managementRisk, icon: Users },
          ...(analysis.fraudDetection?.some(f => f.status !== 'Pass') ? [{
            label: 'Forensic Fraud Risk',
            value: `Detected ${analysis.fraudDetection.filter(f => f.status === 'Fail').length} critical flags and ${analysis.fraudDetection.filter(f => f.status === 'Warning').length} warnings in forensic checks.`,
            icon: ShieldAlert
          }] : [])
        ].map((dim, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="mt-0.5 p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400">
              <dim.icon className="w-3 h-3" />
            </div>
            <div>
              <div className="text-xs text-zinc-500 uppercase mb-0.5">{dim.label}</div>
              <div className="text-xs text-zinc-300 leading-relaxed">{dim.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
