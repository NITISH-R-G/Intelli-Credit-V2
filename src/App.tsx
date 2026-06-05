import { AppError } from "./types";
import { performAnalysis, calculateDisplayAnalysis } from './services/analysisService';
import { DecisionPanel } from './components/DecisionPanel';
import { ErrorDisplay } from './components/ErrorDisplay';
import { DataIngestion } from './components/DataIngestion';
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
import { callMcpTool } from './lib/gemini';
import { searchCasesDeclaration, getMcaInfoDeclaration, fetchDirectorCibilDeclaration, calculateLtvDeclaration, EXTRACTION_PROMPT, RESPONSE_SCHEMA } from './lib/gemini-config';


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
            <DataIngestion
              apiMode={apiMode}
              setApiMode={setApiMode}
              bureauApiKey={bureauApiKey}
              setBureauApiKey={setBureauApiKey}
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              isDragActive={isDragActive}
              loading={loading}
              files={files}
              handleAnalyze={handleAnalyze}
            />

            <ErrorDisplay
              error={error}
              setError={setError}
              showLogs={showLogs}
              setShowLogs={setShowLogs}
            />
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
              <DecisionPanel displayAnalysis={displayAnalysis!} />
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
