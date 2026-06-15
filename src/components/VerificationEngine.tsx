import React from 'react';
import { CreditAnalysis } from '../types';
import { ShieldAlert, Search, AlertTriangle, Building2, FileSearch, Users } from 'lucide-react';

interface VerificationEngineProps {
  analysis: CreditAnalysis;
}

export const VerificationEngine: React.FC<VerificationEngineProps> = ({ analysis }) => {
  return (
    <div className="lg:col-span-2 border border-zinc-800 bg-[#0a0a0a] p-3 flex flex-col">
      <div className="text-xs uppercase text-zinc-500 border-b border-zinc-800 pb-1 mb-2 flex items-center gap-2">
        <Search className="w-3 h-3 text-cyan-500" />
        <span>Trust Engine Verification Log</span>
      </div>
      <div className="overflow-x-auto flex-1 mb-4">
        <table className="w-full text-left text-xs">
          <thead className="text-zinc-500 border-b border-zinc-800">
            <tr>
              <th className="pb-2 font-normal uppercase">Category</th>
              <th className="pb-2 font-normal uppercase">Data Point</th>
              <th className="pb-2 font-normal uppercase">Source</th>
              <th className="pb-2 font-normal uppercase">Status</th>
              <th className="pb-2 font-normal uppercase text-right">Conf</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {analysis.verificationLayer.map((item, index) => (
              <tr key={index} className="hover:bg-zinc-900/30 transition-colors">
                <td className="py-2 text-zinc-400">{item.category}</td>
                <td className="py-2 text-zinc-300">{item.dataPoint}</td>
                <td className="py-2 text-zinc-500">{item.source}</td>
                <td className="py-2">
                  <span
                    className={`px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${
                      item.status === 'Verified'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : item.status === 'Mismatch'
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td
                  className={`py-2 text-right ${
                    item.confidenceScore >= 80
                      ? 'text-emerald-500'
                      : item.confidenceScore >= 50
                        ? 'text-amber-500'
                        : 'text-rose-500'
                  }`}
                >
                  {item.confidenceScore}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Forensic Fraud Detection Indicators */}
      <div
        className={`mt-2 border-t pt-3 transition-colors duration-500 ${
          analysis.shellCompanyAnalysis?.isPotentialShell ? 'border-rose-500/50' : 'border-zinc-800'
        }`}
      >
        <div className="text-[10px] uppercase text-zinc-500 mb-2 flex items-center gap-2">
          <ShieldAlert className="w-3 h-3 text-rose-500" />
          <span>Forensic Fraud Detection (Trust Engine)</span>
          {analysis.shellCompanyAnalysis?.isPotentialShell && (
            <span className="ml-auto px-1.5 py-0.5 bg-rose-500 text-white rounded-sm text-[8px] font-black uppercase tracking-widest animate-pulse">
              Critical Risk
            </span>
          )}
        </div>

        {/* Shell Company Critical Warning */}
        {analysis.shellCompanyAnalysis?.isPotentialShell && (
          <div className="mb-3 p-2 bg-rose-500/10 border border-rose-500/50 rounded-sm flex items-center gap-3 animate-pulse">
            <div className="bg-rose-500 p-1 rounded-full">
              <AlertTriangle className="w-3 h-3 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                Critical Shell Company Risk
              </div>
              <div className="text-[9px] text-rose-400/80 leading-tight">
                High-confidence indicators of a non-operational shell entity detected.
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {analysis.fraudDetection?.map((check, i) => (
            <div
              key={i}
              className={`p-2 border ${
                check.status === 'Fail'
                  ? 'border-rose-900/50 bg-rose-950/10'
                  : check.status === 'Warning'
                    ? 'border-amber-900/50 bg-amber-950/10'
                    : 'border-zinc-800 bg-zinc-900/30'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-[9px] uppercase text-zinc-500">{check.category}</span>
                <span
                  className={`text-[9px] font-bold uppercase ${
                    check.status === 'Fail'
                      ? 'text-rose-500'
                      : check.status === 'Warning'
                        ? 'text-amber-500'
                        : 'text-emerald-500'
                  }`}
                >
                  {check.status}
                </span>
              </div>
              <div className="text-[10px] text-zinc-200 font-medium mb-0.5">{check.indicator}</div>
              <div className="text-[9px] text-zinc-500 leading-tight mb-1">{check.details}</div>
              {check.evidence && (
                <div className="flex items-center gap-1 text-[8px] text-zinc-400 mt-1 pt-1 border-t border-zinc-800/50">
                  <FileSearch className="w-2.5 h-2.5 text-amber-500" />
                  <span className="uppercase tracking-wider font-semibold text-zinc-500">
                    Evidence:
                  </span>
                  <span className="text-zinc-300 italic">{check.evidence}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Shell Company Analysis Sub-Section */}
        {analysis.shellCompanyAnalysis && (
          <div className="mt-4 border-t border-zinc-800/50 pt-3">
            <div className="text-[10px] uppercase text-zinc-500 mb-2 flex items-center gap-2">
              <Building2 className="w-3 h-3 text-amber-500" />
              <span>Shell Company Deep-Dive</span>
              {analysis.shellCompanyAnalysis.isPotentialShell && (
                <span
                  className={`ml-auto px-1.5 py-0.5 rounded-sm text-[8px] font-bold uppercase ${
                    analysis.shellCompanyAnalysis.riskLevel === 'High'
                      ? 'bg-rose-500/20 text-rose-500'
                      : analysis.shellCompanyAnalysis.riskLevel === 'Medium'
                        ? 'bg-amber-500/20 text-amber-500'
                        : 'bg-emerald-500/20 text-emerald-500'
                  }`}
                >
                  {analysis.shellCompanyAnalysis.riskLevel} Risk
                </span>
              )}
            </div>
            <div
              className={`border p-3 rounded-sm ${
                analysis.shellCompanyAnalysis.isPotentialShell
                  ? 'bg-rose-950/10 border-rose-900/50'
                  : 'bg-zinc-900/30 border-zinc-800'
              }`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                <div className="space-y-1">
                  <div className="text-[9px] text-zinc-500 uppercase">Employee Count</div>
                  <div className="text-sm font-medium text-zinc-200">
                    {analysis.shellCompanyAnalysis.employeeCount}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[9px] text-zinc-500 uppercase">Office Type</div>
                  <div className="text-sm font-medium text-zinc-200">
                    {analysis.shellCompanyAnalysis.officeType}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[9px] text-zinc-500 uppercase">Potential Shell</div>
                  <div
                    className={`text-sm font-bold ${analysis.shellCompanyAnalysis.isPotentialShell ? 'text-rose-500' : 'text-emerald-500'}`}
                  >
                    {analysis.shellCompanyAnalysis.isPotentialShell ? 'YES' : 'NO'}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-[9px] text-zinc-500 uppercase mb-1">
                  Operational Evidence & Findings
                </div>
                <ul className="space-y-1">
                  {analysis.shellCompanyAnalysis.operationalEvidence.map((evidence, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[10px] text-zinc-400">
                      <span className="text-amber-500 mt-0.5">•</span>
                      {evidence}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Detailed Shell Indicators */}
              {analysis.shellCompanyAnalysis.indicators &&
                analysis.shellCompanyAnalysis.indicators.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-zinc-800/50">
                    <div className="text-[9px] text-zinc-500 uppercase mb-2">
                      Detailed Risk Indicators
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {analysis.shellCompanyAnalysis.indicators.map((indicator, idx) => (
                        <div
                          key={idx}
                          className={`p-2 border rounded-sm ${
                            indicator.status === 'Fail'
                              ? 'border-rose-900/50 bg-rose-950/10'
                              : indicator.status === 'Warning'
                                ? 'border-amber-900/50 bg-amber-950/10'
                                : 'border-zinc-800 bg-zinc-900/30'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] text-zinc-200 font-bold">
                              {indicator.name}
                            </span>
                            <span
                              className={`text-[8px] font-bold uppercase ${
                                indicator.status === 'Fail'
                                  ? 'text-rose-500'
                                  : indicator.status === 'Warning'
                                    ? 'text-amber-500'
                                    : 'text-emerald-500'
                              }`}
                            >
                              {indicator.status}
                            </span>
                          </div>
                          <div className="text-[9px] text-zinc-400 leading-tight mb-1">
                            {indicator.details}
                          </div>
                          <div className="flex items-center gap-1 text-[8px] text-zinc-500 mt-1 pt-1 border-t border-zinc-800/30">
                            <FileSearch className="w-2.5 h-2.5 text-amber-500" />
                            <span className="font-semibold">Evidence:</span>
                            <span className="italic text-zinc-400">{indicator.evidence}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Director & Shareholder History Sub-Section */}
        {analysis.directorShareholderHistory && (
          <div className="mt-4 border-t border-zinc-800/50 pt-3">
            <div className="text-[10px] uppercase text-zinc-500 mb-2 flex items-center gap-2">
              <Users className="w-3 h-3 text-blue-500" />
              <span>Director & Shareholder History</span>
              {analysis.directorShareholderHistory.hasRapidChanges && (
                <span
                  className={`ml-auto px-1.5 py-0.5 rounded-sm text-[8px] font-bold uppercase ${
                    analysis.directorShareholderHistory.riskLevel === 'High'
                      ? 'bg-rose-500/20 text-rose-500'
                      : analysis.directorShareholderHistory.riskLevel === 'Medium'
                        ? 'bg-amber-500/20 text-amber-500'
                        : 'bg-emerald-500/20 text-emerald-500'
                  }`}
                >
                  {analysis.directorShareholderHistory.riskLevel} Volatility
                </span>
              )}
            </div>
            <div
              className={`border p-3 rounded-sm ${
                analysis.directorShareholderHistory.hasRapidChanges
                  ? 'bg-rose-950/10 border-rose-900/50'
                  : 'bg-zinc-900/30 border-zinc-800'
              }`}
            >
              <div className="mb-3">
                <div className="text-[9px] text-zinc-500 uppercase mb-1">Historical Summary</div>
                <div className="text-[10px] text-zinc-300 leading-relaxed italic border-l-2 border-zinc-700 pl-2">
                  {analysis.directorShareholderHistory.summary}
                </div>
              </div>

              <div>
                <div className="text-[9px] text-zinc-500 uppercase mb-2">
                  Change Events (Last 3-5 Years)
                </div>
                <div className="space-y-2">
                  {analysis.directorShareholderHistory.events.map((event, idx) => (
                    <div
                      key={idx}
                      className="bg-zinc-950/40 p-2 border border-zinc-800/50 rounded-sm"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-zinc-200">{event.date}</span>
                          <span className="px-1 py-0.5 bg-zinc-800 text-[7px] text-zinc-400 rounded uppercase tracking-tighter font-bold">
                            {event.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[8px] text-zinc-500">
                          <FileSearch className="w-2.5 h-2.5 text-amber-500" />
                          <span>{event.evidence}</span>
                        </div>
                      </div>
                      <div className="text-[10px] text-zinc-300 font-medium mb-0.5">
                        {event.description}
                      </div>
                      {event.reason && (
                        <div className="text-[9px] text-zinc-500 italic">
                          Reason: {event.reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
