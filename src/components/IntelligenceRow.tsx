import { Globe, FileSearch, Briefcase } from 'lucide-react';
import { CreditAnalysis } from '../types';

interface IntelligenceRowProps {
  analysis: CreditAnalysis;
}

export function IntelligenceRow({ analysis }: IntelligenceRowProps) {
  return (
    <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-2">
      {/* External Intelligence */}
      <div className="lg:col-span-1 border border-zinc-800 bg-[#0a0a0a] p-3 flex flex-col max-h-80">
        <div className="text-xs uppercase text-zinc-500 border-b border-zinc-800 pb-1 mb-2 flex items-center gap-2 shrink-0">
          <Globe className="w-3 h-3 text-cyan-500" />
          <span>External Intelligence (Live Web)</span>
        </div>
        <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase mb-1">MCA Status</div>
            <div className="text-xs text-zinc-300">{analysis.externalIntelligence.mcaStatus}</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase mb-1">
              Legal Disputes (e-Courts)
            </div>
            <ul className="list-disc list-inside text-xs text-zinc-300 space-y-0.5">
              {analysis.externalIntelligence.legalDisputes.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase mb-1">News & Sector Trends</div>
            <ul className="list-disc list-inside text-xs text-zinc-300 space-y-0.5">
              {analysis.externalIntelligence.newsSectorTrends.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Unstructured Insights */}
      <div className="lg:col-span-1 border border-zinc-800 bg-[#0a0a0a] p-3 flex flex-col max-h-80">
        <div className="text-xs uppercase text-zinc-500 border-b border-zinc-800 pb-1 mb-2 flex items-center gap-2 shrink-0">
          <FileSearch className="w-3 h-3 text-amber-500" />
          <span>Unstructured Insights</span>
        </div>
        <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase mb-1">Rating Agency Reports</div>
            <div className="text-xs text-zinc-300">
              {analysis.unstructuredInsights.ratingAgencyReports}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase mb-1">Shareholding Pattern</div>
            <div className="text-xs text-zinc-300">
              {analysis.unstructuredInsights.shareholdingPattern}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase mb-1">Board Meeting Notes</div>
            <ul className="list-disc list-inside text-xs text-zinc-300 space-y-0.5">
              {analysis.unstructuredInsights.boardMeetingNotes.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Primary Insights */}
      <div className="lg:col-span-1 border border-zinc-800 bg-[#0a0a0a] p-3 flex flex-col max-h-80">
        <div className="text-xs uppercase text-zinc-500 border-b border-zinc-800 pb-1 mb-2 flex items-center gap-2 shrink-0">
          <Briefcase className="w-3 h-3 text-emerald-500" />
          <span>Primary Insights (Due Diligence)</span>
        </div>
        <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase mb-1">Site Visit Observations</div>
            <ul className="list-disc list-inside text-xs text-zinc-300 space-y-0.5">
              {analysis.primaryInsights.siteVisitObservations.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase mb-1">Management Interviews</div>
            <ul className="list-disc list-inside text-xs text-zinc-300 space-y-0.5">
              {analysis.primaryInsights.managementInterviews.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
