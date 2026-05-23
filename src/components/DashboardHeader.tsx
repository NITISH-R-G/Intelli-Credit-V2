import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function DashboardHeader() {
  return (
    <header className="bg-[#050505] border-b border-zinc-800 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-amber-500 text-black px-2 py-0.5 font-bold tracking-widest uppercase text-xs">
          INTELLI-CREDIT
        </div>
        <span className="text-zinc-500 uppercase tracking-widest text-xs">Terminal v2.4.1</span>
      </div>
      <div className="flex items-center gap-4 text-xs text-zinc-500 uppercase">
        <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-500" /> SECURE</span>
        <span>{new Date().toISOString().split('T')[0]}</span>
      </div>
    </header>
  );
}
