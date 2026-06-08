import React from 'react';
import { CreditAnalysis } from '../types';
import { Fingerprint, Activity, Landmark, ShieldCheck, Globe } from 'lucide-react';

interface FiveCsAnalysisProps {
  analysis: CreditAnalysis;
  displayAnalysis: CreditAnalysis;
}

export const FiveCsAnalysis: React.FC<FiveCsAnalysisProps> = ({ analysis, displayAnalysis }) => {
  return (
    <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-5 gap-2">
      {[
        {
          label: 'Character',
          data: displayAnalysis.fiveCs.character,
          icon: Fingerprint,
          color: 'text-blue-400',
        },
        {
          label: 'Capacity',
          data: displayAnalysis.fiveCs.capacity,
          icon: Activity,
          color: 'text-emerald-400',
        },
        {
          label: 'Capital',
          data: displayAnalysis.fiveCs.capital,
          icon: Landmark,
          color: 'text-amber-400',
        },
        {
          label: 'Collateral',
          data: displayAnalysis.fiveCs.collateral,
          icon: ShieldCheck,
          color: 'text-purple-400',
        },
        {
          label: 'Conditions',
          data: displayAnalysis.fiveCs.conditions,
          icon: Globe,
          color: 'text-cyan-400',
        },
      ].map((c, i) => (
        <div key={i} className="border border-zinc-800 bg-[#0a0a0a] p-3 flex flex-col">
          <div className="text-[10px] uppercase text-zinc-500 border-b border-zinc-800 pb-1 mb-2 flex justify-between items-center">
            <div className="flex items-center gap-1">
              <c.icon className={`w-3 h-3 ${c.color}`} />
              <span>{c.label}</span>
            </div>
            <span className={c.color}>{Math.round(c.data.score)}%</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 max-h-40">
            <div className="text-[10px] text-zinc-400 leading-tight mb-2 italic">
              {c.data.insights[0]}
            </div>
            {c.data.positiveSignals.length > 0 && (
              <div className="mb-2">
                <div className="text-[9px] text-emerald-500 uppercase mb-0.5">Signals</div>
                <ul className="text-[9px] text-zinc-500 space-y-0.5">
                  {c.data.positiveSignals.slice(0, 2).map((s, j) => (
                    <li key={j} className="flex gap-1">
                      <span>+</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {c.data.redFlags.length > 0 && (
              <div>
                <div className="text-[9px] text-rose-500 uppercase mb-0.5">Flags</div>
                <ul className="text-[9px] text-zinc-500 space-y-0.5">
                  {c.data.redFlags.slice(0, 2).map((f, j) => (
                    <li key={j} className="flex gap-1">
                      <span>!</span>
                      {f}
                    </li>
                  ))}
                  {c.label === 'Character' &&
                    analysis.fraudDetection
                      ?.filter((f) => f.status === 'Fail')
                      .slice(0, 1)
                      .map((f, j) => (
                        <li key={`fraud-${j}`} className="flex gap-1 text-rose-400 font-bold">
                          <span>!</span>FRAUD: {f.indicator}
                        </li>
                      ))}
                </ul>
              </div>
            )}

            {c.label === 'Collateral' &&
              'assets' in c.data &&
              Array.isArray((c.data as { assets?: import('../types').CollateralAsset[] }).assets) &&
              ((c.data as { assets?: import('../types').CollateralAsset[] }).assets as import('../types').CollateralAsset[]).length > 0 && (
                <div className="mt-3 space-y-2 border-t border-zinc-800 pt-2 shrink-0">
                  <div className="text-[9px] text-zinc-500 uppercase mb-1">Liquidable Assets</div>
                  {((c.data as { assets?: import('../types').CollateralAsset[] }).assets as import('../types').CollateralAsset[]).map((asset: import('../types').CollateralAsset, idx: number) => (
                    <div
                      key={idx}
                      className="bg-zinc-900/50 p-1.5 border border-zinc-800 rounded-sm"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] text-zinc-300 font-medium truncate max-w-[60%]">
                          {asset.type}
                        </span>
                        <span className="text-[9px] text-purple-400 font-bold">
                          {Math.round(asset.ltvRatio * 100)}% LTV
                        </span>
                      </div>
                      <div className="relative h-6 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                        <div
                          className="absolute inset-y-0 left-0 bg-purple-500/30 transition-all duration-1000"
                          style={{ width: `${asset.ltvRatio * 100}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-between px-2 text-[8px] font-mono">
                          <span className="text-zinc-400">
                            Mkt: ₹{(asset.marketValue / 10000000).toFixed(1)}Cr
                          </span>
                          <span className="text-white font-bold">
                            Liq: ₹{(asset.estimatedValue / 10000000).toFixed(1)}Cr
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>
      ))}
    </div>
  );
};
export default FiveCsAnalysis;
