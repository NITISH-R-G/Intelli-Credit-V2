import React from 'react';
import { CreditAnalysis, AppError } from '../types';
import { FileDown, Download } from 'lucide-react';
import { downloadPDF, downloadJSON } from '../lib/export';
import Markdown from 'react-markdown';

interface CAMReportProps {
  analysis: CreditAnalysis;
  isExporting: boolean;
  setIsExporting: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<AppError | null>>;
}

export function CAMReport({ analysis, isExporting, setIsExporting, setError }: CAMReportProps) {
  return (
    <div id="cam-report" className="lg:col-span-12 border border-zinc-800 bg-[#0a0a0a] p-4">
      <div className="text-xs uppercase text-zinc-500 border-b border-zinc-800 pb-2 mb-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileDown className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-bold tracking-widest">Credit Appraisal Memo (CAM)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadJSON(analysis, setError)}
            className="flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 px-3 py-1 text-[10px] transition-colors"
          >
            <Download className="w-3 h-3" /> EXPORT JSON
          </button>
          <button
            onClick={() => downloadPDF('cam-report', setIsExporting, setError)}
            disabled={isExporting}
            className="flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 px-3 py-1 text-[10px] transition-colors disabled:opacity-50"
          >
            <Download className="w-3 h-3" /> {isExporting ? 'EXPORTING...' : 'EXPORT PDF'}
          </button>
        </div>
      </div>

      <div className="prose prose-invert prose-sm max-w-none prose-headings:text-amber-500 prose-headings:uppercase prose-headings:tracking-widest prose-a:text-cyan-400 prose-strong:text-zinc-200">
        <Markdown>{analysis.camMarkdown}</Markdown>
      </div>
    </div>
  );
}
