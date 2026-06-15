import React from 'react';
import { CreditAnalysis } from '../types';
import { FileWarning, CheckCircle2 } from 'lucide-react';

interface ActionRecommendationProps {
  analysis: CreditAnalysis;
}

export function ActionRecommendation({ analysis }: ActionRecommendationProps) {
  return (
    <div className="lg:col-span-1 flex flex-col gap-2">
      <div className="border border-zinc-800 bg-[#0a0a0a] p-3 flex-1">
        <div className="text-xs uppercase text-zinc-500 border-b border-zinc-800 pb-1 mb-2 flex items-center gap-2">
          <FileWarning className="w-3 h-3 text-amber-500" />
          <span>Action Required</span>
        </div>

        {analysis.missingData.length > 0 && (
          <div className="mb-3">
            <div className="text-[10px] text-rose-400 uppercase mb-1">Missing Critical Data</div>
            <ul className="list-disc list-inside text-xs text-zinc-400 space-y-0.5">
              {analysis.missingData.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {analysis.requiredDocs.length > 0 && (
          <div>
            <div className="text-[10px] text-amber-400 uppercase mb-1">Required Documents</div>
            <ul className="list-disc list-inside text-xs text-zinc-400 space-y-0.5">
              {analysis.requiredDocs.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {analysis.missingData.length === 0 && analysis.requiredDocs.length === 0 && (
          <div className="text-xs text-emerald-500 flex items-center gap-2 mt-2">
            <CheckCircle2 className="w-3 h-3" />
            <span>All required data present.</span>
          </div>
        )}
      </div>

      <div
        className={`border p-3 ${
          analysis.recommendation.includes('Approve')
            ? 'border-emerald-900 bg-emerald-950/20'
            : analysis.recommendation.includes('Reject')
              ? 'border-rose-900 bg-rose-950/20'
              : 'border-amber-900 bg-amber-950/20'
        }`}
      >
        <div className="text-xs uppercase text-zinc-500 border-b border-zinc-800/50 pb-1 mb-2">
          Final Recommendation
        </div>
        <div
          className={`text-lg uppercase tracking-wider mb-2 ${
            analysis.recommendation.includes('Approve')
              ? 'text-emerald-500'
              : analysis.recommendation.includes('Reject')
                ? 'text-rose-500'
                : 'text-amber-500'
          }`}
        >
          {analysis.recommendation}
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">{analysis.explanation}</p>
      </div>
    </div>
  );
}
