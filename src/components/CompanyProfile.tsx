import React from 'react';
import { CreditAnalysis } from '../types';

export const CompanyProfile = ({ analysis }: { analysis: CreditAnalysis }) => {
  return (
    <div className="lg:col-span-2 border border-zinc-800 bg-[#0a0a0a] p-3">
      <div className="text-xs uppercase text-zinc-500 border-b border-zinc-800 pb-1 mb-2 flex justify-between">
        <span>Company Profile</span>
        <span className="text-cyan-400">ID: {analysis.companyInfo.registrationNumber}</span>
      </div>
      <h1 className="text-2xl sm:text-3xl text-zinc-100 uppercase tracking-wider mb-1 truncate">
        {analysis.companyInfo.name}
      </h1>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mt-3">
        <div className="flex justify-between border-b border-zinc-800/50 py-1">
          <span className="text-zinc-500">ESTABLISHED</span>
          <span className="text-amber-500">{analysis.companyInfo.establishedYear}</span>
        </div>
        <div className="flex justify-between border-b border-zinc-800/50 py-1">
          <span className="text-zinc-500">INDUSTRY</span>
          <span className="text-amber-500 truncate ml-2 text-right">{analysis.companyInfo.industry}</span>
        </div>
        <div className="flex justify-between border-b border-zinc-800/50 py-1">
          <span className="text-zinc-500">EMPLOYEES</span>
          <span className="text-amber-500">{analysis.companyInfo.employees}</span>
        </div>
        <div className="flex justify-between border-b border-zinc-800/50 py-1">
          <span className="text-zinc-500">STATUS</span>
          <span className="text-emerald-500">ACTIVE</span>
        </div>
      </div>
    </div>
  );
};
