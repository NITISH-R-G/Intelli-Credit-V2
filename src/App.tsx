import { AppError } from "./types";
import { performAnalysis, calculateDisplayAnalysis } from './services/analysisService';
import { CompanyProfile } from './components/CompanyProfile';
import { RiskScorePanel } from './components/RiskScorePanel';
import { FinancialMetrics } from './components/FinancialMetrics';
import { VerificationEngine } from './components/VerificationEngine';
import { IntelligenceRow } from './components/IntelligenceRow';
import { RiskDimensions } from './components/RiskDimensions';
import { ActionRecommendation } from './components/ActionRecommendation';
import { FraudFlags } from './components/FraudFlags';
import { CAMReport } from './components/CAMReport';
import React, { useState, useCallback, useMemo, useRef, Suspense } from 'react';
const StressTestingModule = React.lazy(() => import('./components/StressTestingModule'));
const IndustryBenchmarking = React.lazy(() => import('./components/IndustryBenchmarking'));
const FiveCsAnalysis = React.lazy(() => import('./components/FiveCsAnalysis'));
import { CreditAnalysis } from './types';
import { INDUSTRY_BENCHMARKS } from './constants';
import { useDropzone } from 'react-dropzone';
import { 
  ShieldAlert, 
  ShieldCheck, 
  FileText, 
  Upload, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  BarChart3,
  Loader2,
  Info,
  Search,
  Landmark,
  BadgeAlert,
  History,
  Fingerprint,
  Gavel,
  ShieldQuestion,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { cn } from './lib/utils';
import { GoogleGenAI } from '@google/genai';
import { hashFile, fileToBase64, fileToText } from './lib/file-utils';
import { searchCasesDeclaration, getMcaInfoDeclaration, fetchDirectorCibilDeclaration, calculateLtvDeclaration, callMcpTool, EXTRACTION_PROMPT, RESPONSE_SCHEMA } from './lib/gemini';


export default function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<CreditAnalysis | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [revenueShock, setRevenueShock] = useState(0);
  const [interestRateShock, setInterestRateShock] = useState(0);
  const [bureauApiKey, setBureauApiKey] = useState('');
  const [apiMode, setApiMode] = useState(false); // false = Mock, true = Real
  const fileCache = useRef<Map<string, CreditAnalysis>>(new Map());

  const displayAnalysis: CreditAnalysis | null = useMemo(() => calculateDisplayAnalysis(analysis, revenueShock, interestRateShock), [analysis, revenueShock, interestRateShock]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFiles(acceptedFiles);
      setError(null);
    }
  }, []);

  const onDropRejected = useCallback((fileRejections: any[]) => {
    const firstError = fileRejections[0]?.errors[0];
    setError({
      message: 'File Upload Rejected',
      details: firstError?.message || 'The selected file does not meet the requirements.',
      action: 'Ensure the file is a supported format (PDF, CSV, JSON, TXT) and does not exceed size limits.',
      rawLogs: JSON.stringify(fileRejections, null, 2),
      type: 'FILE_ERROR'
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'text/plain': ['.txt']
    },
    multiple: true,
  } as any);

  const handleAnalyze = async () => {
    await performAnalysis(
      files,
      fileCache,
      apiMode,
      bureauApiKey,
      setLoading,
      setError,
      setAnalysis,
      setShowLogs
    );
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      case 'Medium': return 'text-amber-500 bg-amber-50 border-amber-100';
      case 'High': return 'text-orange-500 bg-orange-50 border-orange-100';
      case 'Critical': return 'text-rose-500 bg-rose-50 border-rose-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  const chartData = analysis ? [
    { name: 'Revenue', value: analysis.structuredData.revenue },
    { name: 'Debt', value: analysis.structuredData.debt },
    { name: 'Profit', value: analysis.structuredData.profit },
    { name: 'Cashflow', value: analysis.structuredData.cashflow },
  ] : [];

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-mono text-xs sm:text-sm selection:bg-amber-500/30">
      {/* Header */}
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

      <main className="p-2 sm:p-4 max-w-[1600px] mx-auto">
        {!analysis ? (
          <div className="border border-zinc-800 bg-[#0a0a0a] p-8 flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-amber-500 mb-4 animate-pulse">
              <Upload className="w-12 h-12" />
            </div>
            <h2 className="text-xl text-zinc-100 uppercase tracking-widest mb-2">Initialize Data Ingestion</h2>
            <p className="text-zinc-500 mb-8 text-center max-w-md">
              Upload financial documents (PDF, Image) for automated extraction, verification, and risk analysis.
            </p>

            {/* Bureau Integrations Panel */}
            <div className="w-full max-w-2xl border border-zinc-800 bg-black p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Bureau Integrations</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-medium uppercase tracking-tighter ${!apiMode ? "text-amber-500" : "text-zinc-600"}`}>Gemini Generated (Mock)</span>
                  <button
                    onClick={() => setApiMode(!apiMode)}
                    className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none ${
                      apiMode ? "bg-amber-600" : "bg-zinc-800"
                    }`}
                  >
                    <span
                      className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${
                        apiMode ? "translate-x-4" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className={`text-[10px] font-medium uppercase tracking-tighter ${apiMode ? "text-amber-500" : "text-zinc-600"}`}>Real API</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest">External Bureau API Key</label>
                <input
                  type="password"
                  value={bureauApiKey}
                  onChange={(e) => setBureauApiKey(e.target.value)}
                  placeholder="Enter your API key for real-time bureau checks..."
                  className="w-full px-3 py-2 bg-[#050505] border border-zinc-800 text-zinc-300 text-xs focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-zinc-700"
                />
              </div>
            </div>
            
            <div
              {...getRootProps()}
              className={`w-full max-w-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-amber-500 bg-amber-500/5' : 'border-zinc-800 hover:border-zinc-600 bg-black'
              }`}
            >
              <input {...getInputProps()} />
              {loading ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                  <p className="text-amber-500 uppercase tracking-widest animate-pulse">Processing & Verifying Data...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <FileText className="w-8 h-8 text-zinc-600 mb-2" />
                  <p className="text-zinc-400 uppercase tracking-wider">Drag & drop files here, or click to select</p>
                  <p className="text-zinc-600 text-xs mt-2">Supported: PDF, JPEG, PNG</p>
                </div>
              )}
            </div>
            
            {files.length > 0 && !loading && (
              <div className="mt-4 w-full max-w-2xl">
                <p className="text-zinc-400 text-xs uppercase mb-2">Uploaded Documents:</p>
                <ul className="space-y-1">
                  {files.map((f, i) => (
                    <li key={i} className="text-zinc-500 text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {f.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {files.length > 0 && !loading && (
              <button
                onClick={handleAnalyze}
                className="mt-6 border border-amber-500 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black px-8 py-3 uppercase tracking-widest font-bold transition-colors flex items-center gap-2"
              >
                <TrendingUp className="w-5 h-5" />
                Execute Analysis
              </button>
            )}

            {error && (
              <div className="mt-6 border border-rose-900 bg-rose-950/30 p-4 w-full max-w-2xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-rose-500 font-bold uppercase tracking-widest text-xs">
                        {error.type.replace('_', ' ')}: {error.message}
                      </h3>
                      <span className="text-[10px] text-rose-900 font-mono">CODE: {error.type}</span>
                    </div>
                    {error.details && (
                      <p className="text-rose-400/80 text-[11px] leading-relaxed font-mono">
                        {error.details}
                      </p>
                    )}
                    {error.action && (
                      <div className="pt-2 flex items-center gap-2">
                        <div className="h-1 w-1 bg-amber-500 rounded-full animate-pulse" />
                        <p className="text-amber-500 text-[10px] uppercase tracking-wider font-bold">
                          Suggested Action: {error.action}
                        </p>
                      </div>
                    )}

                    {error.rawLogs && (
                      <div className="mt-4 border-t border-rose-900/30 pt-3">
                        <button 
                          onClick={() => setShowLogs(!showLogs)}
                          className="flex items-center gap-2 text-[10px] text-rose-400/60 hover:text-rose-400 uppercase tracking-widest transition-colors"
                        >
                          <ChevronRight className={`w-3 h-3 transition-transform ${showLogs ? 'rotate-90' : ''}`} />
                          {showLogs ? 'Hide Technical Logs' : 'View Technical Logs'}
                        </button>
                        
                        {showLogs && (
                          <div className="mt-2 bg-black/50 p-3 border border-rose-900/20 overflow-x-auto">
                            <pre className="text-[9px] text-rose-400/70 font-mono leading-tight whitespace-pre-wrap break-all">
                              {error.rawLogs}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setError(null);
                    setShowLogs(false);
                  }}
                  className="mt-4 w-full py-1 border border-rose-900/50 hover:bg-rose-900/20 text-rose-500 text-[10px] uppercase tracking-widest transition-colors"
                >
                  Dismiss Error
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
            
            {/* Top Row: Company Profile & Core Stats */}
            <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-4 gap-2">
              {/* Company Info Panel */}
              <CompanyProfile analysis={analysis} />

              {/* Risk Score Panel */}
               <RiskScorePanel displayAnalysis={displayAnalysis!} />

              {/* Decision Panel */}
              <div className="border border-zinc-800 bg-[#0a0a0a] p-3 flex flex-col justify-between">
                <div className="text-xs uppercase text-zinc-500 border-b border-zinc-800 pb-1 mb-2">
                  Loan Recommendation
                </div>
                <div className="flex items-end justify-between">
                  <div className={`text-3xl font-light ${
                    displayAnalysis.recommendation.includes('Approve') ? 'text-emerald-500' :
                    displayAnalysis.recommendation.includes('Reject') ? 'text-rose-500' : 'text-amber-500'
                  }`}>
                    {displayAnalysis.suggestedLoanAmount}
                  </div>
                  <div className="text-right">
                    <div className="text-zinc-400 text-xs uppercase">Rate: {displayAnalysis.suggestedInterestRate}</div>
                    <div className="text-zinc-500 text-xs uppercase tracking-tighter">Confidence: {displayAnalysis.decisionConfidence}%</div>
                  </div>
                </div>
              </div>
            </div>

            <Suspense fallback={<div className="lg:col-span-12 p-4 text-center text-zinc-500">Loading modules...</div>}>
              <StressTestingModule
                revenueShock={revenueShock}
                setRevenueShock={setRevenueShock}
                interestRateShock={interestRateShock}
                setInterestRateShock={setInterestRateShock}
                analysis={analysis}
                displayAnalysis={displayAnalysis!}
              />

              <IndustryBenchmarking analysis={analysis} />

              <FiveCsAnalysis analysis={analysis} displayAnalysis={displayAnalysis!} />
            </Suspense>

            {/* Middle Row: Financials & Verification */}
            <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-2">
              
              {/* Financial Data */}
              <FinancialMetrics analysis={analysis} />

              <VerificationEngine analysis={analysis} />
            </div>

            {/* Intelligence Row: External, Unstructured, Primary */}
            <IntelligenceRow analysis={analysis} />

            {/* Bottom Row: Risk Dimensions & Actions */}
            <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-2">
              <RiskDimensions analysis={analysis} />
              <ActionRecommendation analysis={analysis} />
            </div>

            {/* Fraud Flags */}
            <FraudFlags analysis={analysis} />

            {/* CAM Report Section */}
            <CAMReport analysis={analysis} isExporting={isExporting} setIsExporting={setIsExporting} setError={setError} />

            <div className="lg:col-span-12 flex justify-end mt-4">
              <button
                onClick={() => setAnalysis(null)}
                className="border border-zinc-700 hover:border-zinc-500 bg-black text-zinc-400 hover:text-zinc-200 px-6 py-2 text-xs uppercase tracking-widest transition-colors"
              >
                [ Reset Terminal ]
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
