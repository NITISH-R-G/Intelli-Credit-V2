import React from 'react';
import { CreditAnalysis } from '../types';

interface StressTestingModuleProps {
  revenueShock: number;
  setRevenueShock: (v: number) => void;
  interestRateShock: number;
  setInterestRateShock: (v: number) => void;
  analysis: CreditAnalysis;
  displayAnalysis: CreditAnalysis;
}

export function StressTestingModule({
  revenueShock,
  setRevenueShock,
  interestRateShock,
  setInterestRateShock,
  analysis,
  displayAnalysis,
}: StressTestingModuleProps) {
  return (
    <div className="lg:col-span-12 border border-zinc-800 bg-[#0a0a0a] p-4">
      <div className="text-xs uppercase text-zinc-500 border-b border-zinc-800 pb-2 mb-4 flex justify-between">
        <span>Stress Testing (What-If Scenarios)</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">
              Revenue Shock ({revenueShock}%)
            </label>
            <input
              type="range"
              min="-30"
              max="30"
              value={revenueShock}
              onChange={(e) => setRevenueShock(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">
              Interest Rate Shock ({interestRateShock}%)
            </label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={interestRateShock}
              onChange={(e) => setInterestRateShock(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {displayAnalysis && (
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <div className="border border-zinc-800 p-3">
              <div className="text-[10px] text-zinc-500 uppercase">Baseline Risk Grade</div>
              <div className="text-2xl text-zinc-300">{analysis.riskGrade}</div>
            </div>
            <div className="border border-amber-900/30 bg-amber-950/10 p-3">
              <div className="text-[10px] text-amber-500 uppercase">Stressed Risk Grade</div>
              <div className="text-2xl text-amber-500">{displayAnalysis.riskGrade}</div>
            </div>
            <div className="border border-zinc-800 p-3 text-xs">
              <div className="text-zinc-500 uppercase">Stressed DSCR</div>
              <div className="text-lg text-zinc-200">
                {(displayAnalysis.ratios.dscr ?? 0).toFixed(2)}
              </div>
            </div>
            <div className="border border-zinc-800 p-3 text-xs">
              <div className="text-zinc-500 uppercase">Stressed ICR</div>
              <div className="text-lg text-zinc-200">
                {(displayAnalysis.ratios.icr ?? 0).toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default StressTestingModule;
