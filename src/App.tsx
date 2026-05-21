import React, { useState, useCallback, useMemo, useRef } from 'react';
import { CreditAnalysis } from './types';
import { INDUSTRY_BENCHMARKS } from './constants';
import { useDropzone } from 'react-dropzone';
import { 
  ShieldAlert, 
  ShieldCheck, 
  FileText, 
  Upload, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Users,
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  BarChart3,
  Loader2,
  Info,
  Search,
  FileWarning,
  Building2,
  Scale,
  Landmark,
  BadgeAlert,
  Globe,
  FileSearch,
  Briefcase,
  Download,
  FileDown,
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
import { downloadPDF, downloadJSON } from './lib/export';
import { hashFile, fileToBase64, fileToText } from './lib/file-utils';
import { searchCasesDeclaration, getMcaInfoDeclaration, fetchDirectorCibilDeclaration, calculateLtvDeclaration, callMcpTool, EXTRACTION_PROMPT, RESPONSE_SCHEMA } from './lib/gemini';

import Markdown from 'react-markdown';

export interface AppError {
  message: string;
  details?: string;
  action?: string;
  rawLogs?: string;
  type: 'API_ERROR' | 'FILE_ERROR' | 'PARSING_ERROR' | 'VALIDATION_ERROR' | 'UNKNOWN';
}

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

  const displayAnalysis: CreditAnalysis | null = useMemo(() => {
    if (!analysis) return null;
    if (revenueShock === 0 && interestRateShock === 0) {
      return {
        ...analysis,
        fraudDetection: analysis.fraudDetection || [],
        fraudFlags: [
          ...(analysis.fraudFlags || []),
          ...(analysis.fraudDetection?.filter(f => f.status === 'Fail').map(f => `FORENSIC: ${f.indicator}`) || [])
        ],
        ratios: {
          ...analysis.ratios,
          dscr: analysis.ratios.dscr ?? 0,
          icr: analysis.ratios.icr ?? 0,
        }
      };
    }

    // 1. Financial Modeling
    const lastIdx = analysis.structuredData.revenue.length - 1;
    const baseRevenue = analysis.structuredData.revenue[lastIdx].value;
    const baseProfit = analysis.structuredData.profit[lastIdx].value;
    const baseDebt = analysis.structuredData.debt[lastIdx].value;
    const baseInterestRate = parseFloat(analysis.suggestedInterestRate.replace('%', '')) / 100;
    
    // Stressed Financials
    const stressedRevenue = baseRevenue * (1 + revenueShock / 100);
    const stressedProfit = baseProfit * (1 + revenueShock / 100);
    const stressedInterest = baseDebt * (baseInterestRate + interestRateShock / 100);
    const stressedCashflow = stressedProfit - stressedInterest;
    
    // 2. Statistical Ratios
    const stressedProfitMargin = stressedRevenue > 0 ? (stressedProfit - stressedInterest) / stressedRevenue : 0;
    const stressedDebtToIncome = stressedRevenue > 0 ? baseDebt / stressedRevenue : 0;
    
    // Estimate DSCR (assuming 10% principal repayment)
    const estimatedPrincipal = baseDebt * 0.1;
    const stressedDSCR = (stressedInterest + estimatedPrincipal) > 0 ? stressedCashflow / (stressedInterest + estimatedPrincipal) : 0;
    const stressedICR = stressedInterest > 0 ? stressedProfit / stressedInterest : 0;
    
    // 3. Risk Score Calculation (Statistical Model)
    const industry = analysis.companyInfo.industry;
    const benchmark = INDUSTRY_BENCHMARKS[industry] || INDUSTRY_BENCHMARKS['Manufacturing']; // Default to Manufacturing
    
    let stressedRiskScore = 50;
    // DSCR Impact
    if (stressedDSCR < 1.0) stressedRiskScore += 30;
    else if (stressedDSCR < 1.25) stressedRiskScore += 15;
    // ICR Impact
    if (stressedICR < 1.5) stressedRiskScore += 20;
    // Leverage Impact (Using industry benchmark for Profit Margin and Leverage)
    if (stressedProfitMargin < benchmark.profitMargin) stressedRiskScore += 15;
    if (stressedDebtToIncome > benchmark.debtToEquity) stressedRiskScore += 15;
    
    // Fraud Impact
    const criticalFraudCount = analysis.fraudDetection?.filter(f => f.status === 'Fail').length || 0;
    const warningFraudCount = analysis.fraudDetection?.filter(f => f.status === 'Warning').length || 0;
    stressedRiskScore += (criticalFraudCount * 25) + (warningFraudCount * 10);
    
    stressedRiskScore = Math.min(Math.max(stressedRiskScore, 0), 100);
    
    // 4. Grade & Recommendation
    let stressedRiskGrade = "AAA";
    let stressedRiskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = "Low";
    let stressedRecommendation = "Approve";
    
    if (stressedRiskScore > 85) {
        stressedRiskGrade = "C";
        stressedRiskLevel = "Critical";
        stressedRecommendation = "Reject";
    } else if (stressedRiskScore > 60) {
        stressedRiskGrade = "BB";
        stressedRiskLevel = "High";
        stressedRecommendation = "Refer for Review";
    } else if (stressedRiskScore > 30) {
        stressedRiskGrade = "BBB";
        stressedRiskLevel = "Medium";
        stressedRecommendation = "Approve with Conditions";
    }

    const shockFactor = Math.abs(revenueShock) / 100 + Math.abs(interestRateShock) / 5;
    const stressedConfidence = Math.max(analysis.decisionConfidence - Math.round(shockFactor * 50), 20);
    
    // Parse loan amount safely (it might be a number or a string from the AI)
    let baseLoanAmount = 0;
    if (typeof analysis.suggestedLoanAmount === 'number') {
      baseLoanAmount = analysis.suggestedLoanAmount;
    } else if (typeof analysis.suggestedLoanAmount === 'string') {
      // Handle potential ranges or units if the AI ignores the schema
      const numbers = analysis.suggestedLoanAmount.match(/\d+(\.\d+)?/g);
      if (numbers && numbers.length > 0) {
        // If it's a range, take the lower bound to be conservative
        baseLoanAmount = parseFloat(numbers[0]);
        // Handle common Indian units if present
        const lowerStr = analysis.suggestedLoanAmount.toLowerCase();
        if (lowerStr.includes('cr') || lowerStr.includes('crore')) baseLoanAmount *= 10000000;
        else if (lowerStr.includes('lakh')) baseLoanAmount *= 100000;
      }
    }

    const stressedLoanAmount = (baseLoanAmount * (1 + revenueShock / 200)).toLocaleString('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0
    });

    const combinedFraudFlags = [
      ...(analysis.fraudFlags || []),
      ...(analysis.fraudDetection?.filter(f => f.status === 'Fail').map(f => `FORENSIC: ${f.indicator}`) || [])
    ];

    return {
      ...analysis,
      fraudDetection: analysis.fraudDetection || [],
      fraudFlags: combinedFraudFlags,
      riskScore: stressedRiskScore,
      riskGrade: stressedRiskGrade,
      riskLevel: stressedRiskLevel,
      recommendation: stressedRecommendation,
      decisionConfidence: stressedConfidence,
      suggestedLoanAmount: stressedLoanAmount,
      ratios: {
        ...analysis.ratios,
        debtToIncome: stressedDebtToIncome,
        profitMargin: stressedProfitMargin,
        dscr: stressedDSCR,
        icr: stressedICR
      },
      structuredData: {
        ...analysis.structuredData,
        cashflow: analysis.structuredData.cashflow.map((c, i) => i === lastIdx ? { ...c, value: stressedCashflow } : c),
        profit: analysis.structuredData.profit.map((p, i) => i === lastIdx ? { ...p, value: stressedProfit } : p),
      },
      fiveCs: {
        ...analysis.fiveCs,
        capacity: {
          ...analysis.fiveCs.capacity,
          score: Math.min(Math.max(analysis.fiveCs.capacity.score - (stressedDSCR < 1.2 ? 20 : 0), 0), 100)
        },
        capital: {
          ...analysis.fiveCs.capital,
          score: Math.min(Math.max(analysis.fiveCs.capital.score - (stressedDebtToIncome > 0.8 ? 20 : 0), 0), 100)
        }
      }
    };
  }, [analysis, revenueShock, interestRateShock]);

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
    if (files.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const fileHashes = await Promise.all(files.map(hashFile));
      const combinedHash = fileHashes.join('');
      
      if (fileCache.current.has(combinedHash)) {
        setAnalysis(fileCache.current.get(combinedHash)!);
        setLoading(false);
        return;
      }

      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";
      
      // Convert files to parts
      const fileParts = await Promise.all(files.map(async (f) => {
        const buffer = await f.arrayBuffer();
        const base64 = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
        return {
          inlineData: {
            mimeType: f.type,
            data: base64
          }
        };
      }));

      const config = {
        tools: [
          { googleSearch: {} },
          { functionDeclarations: [searchCasesDeclaration, getMcaInfoDeclaration, fetchDirectorCibilDeclaration, calculateLtvDeclaration] }
        ],
        toolConfig: { includeServerSideToolInvocations: true },
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA as any,
      };

      let currentContents: any[] = [];

      for (const f of files) {
        if (f.type === "application/pdf" || f.type.startsWith("image/")) {
          const base64Data = await fileToBase64(f);
          currentContents.push({
            role: "user",
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: f.type,
                },
              },
            ],
          });
        } else {
          const text = await fileToText(f);
          currentContents.push({
            role: "user",
            parts: [
              {
                text: `Document Name: ${f.name}\n\nDocument Text:\n${text.substring(0, 10000)}`,
              },
            ],
          });
        }
      }
      
      // Add the extraction prompt to the last content part
      if (currentContents.length > 0) {
        currentContents[currentContents.length - 1].parts.push({ text: EXTRACTION_PROMPT });
      } else {
        throw new Error("No valid documents found for analysis.");
      }

      let extractionResponse = await genAI.models.generateContent({
        model,
        contents: currentContents,
        config,
      });

      let iterations = 0;
      const MAX_ITERATIONS = 10;
      while (extractionResponse.functionCalls && extractionResponse.functionCalls.length > 0 && iterations < MAX_ITERATIONS) {
        const call = extractionResponse.functionCalls[0];
        
        let toolResult;
        if (call.name === "search_cases" || call.name === "fetch_director_cibil" || call.name === "calculate_ltv" || call.name === "get_mca_info") {
          toolResult = await callMcpTool(call.name, call.args, apiMode, bureauApiKey);
        } else {
          toolResult = { error: "Unknown tool" };
        }

        if (toolResult && toolResult.error) {
          throw new Error(`TOOL_ERROR: ${toolResult.error}`);
        }
        
        currentContents.push(extractionResponse.candidates![0].content);
        currentContents.push({
          role: "user",
          parts: [{
            functionResponse: {
              name: call.name,
              response: { result: toolResult }
            }
          }]
        });
        
        extractionResponse = await genAI.models.generateContent({
          model,
          contents: currentContents,
          config,
        });
        
        iterations++;
      }

      if (!extractionResponse.text) {
        if (extractionResponse.functionCalls && extractionResponse.functionCalls.length > 0) {
          throw new Error("Analysis stopped: Too many tool calls required. The model is still trying to gather information.");
        }
        
        const finishReason = extractionResponse.candidates?.[0]?.finishReason;
        if (finishReason === 'SAFETY') {
          throw new Error("Analysis Failed: The document content was flagged by safety filters.");
        }
        
        throw new Error("Failed to extract data from document: The model returned an empty response. This can happen if the document is too complex or the prompt is too restrictive.");
      }

      const parsedData = JSON.parse(extractionResponse.text);
      
      // Feature Calculations
      const latestRevenue = parsedData.structuredData.revenue[parsedData.structuredData.revenue.length - 1].value;
      const latestDebt = parsedData.structuredData.debt[parsedData.structuredData.debt.length - 1].value;
      const latestProfit = parsedData.structuredData.profit[parsedData.structuredData.profit.length - 1].value;
      const latestAssets = parsedData.structuredData.assets[parsedData.structuredData.assets.length - 1].value;
      const latestLiabilities = parsedData.structuredData.liabilities[parsedData.structuredData.liabilities.length - 1].value;
      const latestCashflow = parsedData.structuredData.cashflow[parsedData.structuredData.cashflow.length - 1].value;
      
      const debtToIncome = latestRevenue > 0 ? latestDebt / latestRevenue : 1;
      const profitMargin = latestRevenue > 0 ? latestProfit / latestRevenue : 0;
      const currentRatio = latestLiabilities > 0 ? latestAssets / latestLiabilities : 1;

      // Risk Scoring (Rule-based + Verification Penalty)
      let riskScore = 50; // Base score
      if (debtToIncome > 0.5) riskScore += 15;
      if (debtToIncome > 0.8) riskScore += 15;
      if (profitMargin < 0.1) riskScore += 10;
      if (currentRatio < 1.2) riskScore += 10;
      if (latestCashflow < 0) riskScore += 15;
      
      // Penalize for unverified or mismatched data
      const unverifiedCount = parsedData.verificationLayer.filter((v: any) => v.status === 'Unverified').length;
      const mismatchCount = parsedData.verificationLayer.filter((v: any) => v.status === 'Mismatch').length;
      riskScore += (unverifiedCount * 5);
      riskScore += (mismatchCount * 15);
      
      // Fraud Detection (Simple Anomaly Rules)
      const fraudFlags = [];
      let forceReject = false;
      let forceRefer = false;

      if (latestRevenue > 0 && latestProfit > latestRevenue) {
        fraudFlags.push("Profit exceeds revenue (Impossible state)");
        forceReject = true;
      }
      if (latestDebt > latestAssets * 2) {
        fraudFlags.push("Extreme leverage detected");
        forceRefer = true;
      }
      if (latestCashflow === 0 && latestRevenue > 1000000) {
        fraudFlags.push("Suspiciously zero cashflow for high revenue");
        forceRefer = true;
      }
      
      const currentYear = new Date().getFullYear();
      const age = currentYear - parseInt(parsedData.companyInfo.establishedYear || currentYear);
      if (age <= 1 && latestRevenue > 100000000) { // > 10 Cr for < 1 year old company
        fraudFlags.push("Unusually high revenue for a newly established entity");
        forceRefer = true;
      }

      if (parsedData.structuredData.revenue.length >= 2) {
        const prevRevenue = parsedData.structuredData.revenue[parsedData.structuredData.revenue.length - 2].value;
        if (prevRevenue > 0 && latestRevenue / prevRevenue > 5) { // > 500% growth
          fraudFlags.push("Extreme revenue growth detected (>500%)");
          forceRefer = true;
        }
      }

      if (latestRevenue > 100000000 && profitMargin < 0.01) { // > 10 Cr with < 1% profit
        fraudFlags.push("Suspiciously low profitability relative to high revenue");
        forceRefer = true;
      }

      // Shell Company Detection: Low employees relative to high revenue
      const employeeCount = parseInt(String(parsedData.companyInfo.employees).replace(/[^0-9]/g, '')) || 0;
      if (latestRevenue > 50000000 && employeeCount > 0 && employeeCount < 5) { // > 5 Cr with < 5 employees
        fraudFlags.push("Potential Shell Company: Unusually low employee count for stated revenue");
        forceRefer = true;
      }

      if (mismatchCount > 0) {
        fraudFlags.push(`${mismatchCount} data mismatch(es) detected during verification`);
      }

      // Adjust score based on fraud flags
      if (forceReject) riskScore += 50;
      if (forceRefer) riskScore += 20;
      
      // AI-detected fraud penalties
      const aiFraudFails = parsedData.fraudDetection.filter((f: any) => f.status === 'Fail').length;
      const aiFraudWarnings = parsedData.fraudDetection.filter((f: any) => f.status === 'Warning').length;
      riskScore += (aiFraudFails * 20);
      riskScore += (aiFraudWarnings * 10);
      
      // Specific Shell Company Penalty
      const shellIndicators = parsedData.fraudDetection.filter((f: any) => 
        f.indicator.toLowerCase().includes('shell') || 
        f.details.toLowerCase().includes('virtual office') ||
        f.details.toLowerCase().includes('low employee') ||
        f.details.toLowerCase().includes('director change') ||
        f.details.toLowerCase().includes('shareholder change')
      );
      if (shellIndicators.some((f: any) => f.status === 'Fail')) riskScore += 30;
      else if (shellIndicators.some((f: any) => f.status === 'Warning')) riskScore += 15;

      // Shell Company Analysis Object Penalty
      if (parsedData.shellCompanyAnalysis) {
        const sca = parsedData.shellCompanyAnalysis;
        if (sca.isPotentialShell) {
          if (sca.riskLevel === 'High') riskScore += 25;
          else if (sca.riskLevel === 'Medium') riskScore += 15;
        }

        // Check detailed indicators in shellCompanyAnalysis
        if (sca.indicators && sca.indicators.length > 0) {
          const scaFails = sca.indicators.filter((f: any) => f.status === 'Fail').length;
          const scaWarnings = sca.indicators.filter((f: any) => f.status === 'Warning').length;
          riskScore += (scaFails * 15);
          riskScore += (scaWarnings * 5);
          
          sca.indicators.forEach((ind: any) => {
            if (ind.status === 'Fail' || ind.status === 'Warning') {
              fraudFlags.push(`Shell Indicator (${ind.status}): ${ind.name} - ${ind.details}`);
            }
          });
        }
        
        // Check operational evidence for specific red flags
        const evidenceStr = sca.operationalEvidence.join(' ').toLowerCase();
        if (evidenceStr.includes('no physical assets') || evidenceStr.includes('lack of assets')) {
          riskScore += 15;
          fraudFlags.push("Shell Indicator: Lack of physical assets on balance sheet");
        }
        if (evidenceStr.includes('virtual office') || evidenceStr.includes('registered office only')) {
          riskScore += 15;
          fraudFlags.push("Shell Indicator: Official filings mention virtual/registered office only");
        }
      }

      // Director & Shareholder History Penalty
      if (parsedData.directorShareholderHistory) {
        const dsh = parsedData.directorShareholderHistory;
        if (dsh.hasRapidChanges) {
          if (dsh.riskLevel === 'High') riskScore += 25;
          else if (dsh.riskLevel === 'Medium') riskScore += 15;
          fraudFlags.push(`History Alert: Rapid or unexplained changes in directors/shareholders detected (${dsh.riskLevel} Volatility)`);
        }
      }
      
      // Primary Insights Penalty (Lack of operations)
      const siteVisitNotes = parsedData.primaryInsights.siteVisitObservations.join(' ').toLowerCase();
      if (siteVisitNotes.includes('no physical operations') || siteVisitNotes.includes('closed') || siteVisitNotes.includes('virtual office')) {
        riskScore += 25;
        fraudFlags.push("Primary Insight: Lack of demonstrable physical operations at site");
      }
      
      // External Intelligence Penalty (MCA Status)
      const mcaStatus = parsedData.externalIntelligence.mcaStatus.toLowerCase();
      if (mcaStatus.includes('dormant') || mcaStatus.includes('struck off') || mcaStatus.includes('inactive')) {
        riskScore += 40;
        fraudFlags.push(`External Intelligence: Critical MCA Status (${parsedData.externalIntelligence.mcaStatus})`);
      }
      
      // Legal Dispute Penalty
      const legalNotes = parsedData.externalIntelligence.legalDisputes.join(' ').toLowerCase();
      if (legalNotes.includes('fraud') || legalNotes.includes('money laundering') || legalNotes.includes('scam')) {
        riskScore += 35;
        fraudFlags.push("External Intelligence: Critical legal disputes involving fraud/money laundering");
      }
      
      // Shareholding Pattern Penalty
      const shareholding = parsedData.unstructuredInsights.shareholdingPattern.toLowerCase();
      if (shareholding.includes('opaque') || shareholding.includes('complex') || shareholding.includes('shell')) {
        riskScore += 20;
        fraudFlags.push("Unstructured Insight: Opaque or complex shareholding pattern");
      }
      
      // Board Meeting Notes Penalty
      const boardNotes = parsedData.unstructuredInsights.boardMeetingNotes.join(' ').toLowerCase();
      if (boardNotes.includes('related party') || boardNotes.includes('unusual') || boardNotes.includes('deviation')) {
        riskScore += 15;
        fraudFlags.push("Unstructured Insight: Unusual board meeting notes or related party transactions mentioned");
      }
      
      // Management Interview Penalty
      const interviewNotes = parsedData.primaryInsights.managementInterviews.join(' ').toLowerCase();
      if (interviewNotes.includes('evasive') || interviewNotes.includes('contradictory') || interviewNotes.includes('unclear')) {
        riskScore += 20;
        fraudFlags.push("Primary Insight: Evasive or contradictory management responses");
      }
      
      // Rating Agency Penalty
      const ratingReport = parsedData.unstructuredInsights.ratingAgencyReports.toLowerCase();
      if (ratingReport.includes('downgrade') || ratingReport.includes('negative') || ratingReport.includes('default')) {
        riskScore += 30;
        fraudFlags.push("Unstructured Insight: Negative rating agency report or downgrade");
      }
      
      // News/Sector Trends Penalty
      const newsNotes = parsedData.externalIntelligence.newsSectorTrends.join(' ').toLowerCase();
      if (newsNotes.includes('scandal') || newsNotes.includes('investigation') || newsNotes.includes('fraud') || newsNotes.includes('crisis')) {
        riskScore += 25;
        fraudFlags.push("External Intelligence: Negative news or sector-wide crisis detected");
      }

      riskScore = Math.min(Math.max(riskScore, 0), 100);

      let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = "Low";
      let riskGrade = "AAA";
      let recommendation = "Approve";

      if (riskScore > 85) {
        riskLevel = "Critical";
        riskGrade = "C";
        recommendation = "Reject";
      } else if (riskScore > 60) {
        riskLevel = "High";
        riskGrade = "BB";
        recommendation = "Refer for Review";
      } else if (riskScore > 30) {
        riskLevel = "Medium";
        riskGrade = "BBB";
        recommendation = "Approve with Conditions";
      } else {
        riskLevel = "Low";
        riskGrade = "AAA";
        recommendation = "Approve";
      }

      const result: CreditAnalysis = {
        ...parsedData,
        ratios: {
          debtToIncome,
          profitMargin,
          currentRatio
        },
        riskScore,
        riskLevel,
        riskGrade,
        recommendation,
        fraudFlags
      };

      fileCache.current.set(combinedHash, result);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      const rawLogs = err instanceof Error ? err.stack || err.message : String(err);
      let appError: AppError = {
        message: 'Analysis Failed',
        details: err instanceof Error ? err.message : 'An unknown error occurred during document processing.',
        rawLogs,
        type: 'UNKNOWN'
      };

      if (err instanceof Error) {
        if (err.message.includes('API_KEY')) {
          appError = {
            message: 'Authentication Error',
            details: 'The Gemini API key is missing or invalid.',
            action: 'Ensure the GEMINI_API_KEY is properly configured in the environment.',
            rawLogs,
            type: 'API_ERROR'
          };
        } else if (err.message.includes('JSON')) {
          appError = {
            message: 'Data Parsing Error',
            details: 'The AI model returned an invalid data format that could not be processed.',
            action: 'Try re-running the analysis or using a clearer document scan.',
            rawLogs,
            type: 'PARSING_ERROR'
          };
        } else if (err.message.includes('fetch')) {
          appError = {
            message: 'Network Error',
            details: 'Failed to communicate with external bureau services or the AI model.',
            action: 'Check your internet connection and verify the API key.',
            rawLogs,
            type: 'API_ERROR'
          };
        } else if (err.message.includes('TOOL_ERROR')) {
          appError = {
            message: 'Integration Tool Error',
            details: err.message.replace('TOOL_ERROR: ', ''),
            action: 'Verify your API keys and integration settings in the Bureau panel.',
            rawLogs,
            type: 'API_ERROR'
          };
        } else if (err.message.includes('FILE_ERROR')) {
          appError = {
            message: 'File Processing Error',
            details: err.message.replace('FILE_ERROR: ', ''),
            action: 'Check if the file is corrupted or in an unsupported format.',
            rawLogs,
            type: 'FILE_ERROR'
          };
        }
      }

      setShowLogs(false);
      setError(appError);
    } finally {
      setLoading(false);
    }
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

              {/* Risk Score Panel */}
               <div className="border border-zinc-800 bg-[#0a0a0a] p-3 flex flex-col justify-between">
                <div className="text-xs uppercase text-zinc-500 border-b border-zinc-800 pb-1 mb-2 flex justify-between">
                  <span>Risk Grade</span>
                  <span className="text-amber-500">{displayAnalysis.riskGrade}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div className={`text-5xl font-light ${
                    displayAnalysis.riskScore >= 70 ? 'text-emerald-500' :
                    displayAnalysis.riskScore >= 40 ? 'text-amber-500' : 'text-rose-500'
                  }`}>
                    {displayAnalysis.riskScore}
                  </div>
                  <div className="text-right">
                    <div className={`text-lg uppercase tracking-widest ${
                      displayAnalysis.riskLevel === 'Low' ? 'text-emerald-500' :
                      displayAnalysis.riskLevel === 'Medium' ? 'text-amber-500' : 'text-rose-500'
                    }`}>
                      {displayAnalysis.riskLevel} RISK
                    </div>
                    <div className="text-zinc-500 text-xs">OUT OF 100</div>
                  </div>
                </div>
              </div>

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

            {/* Stress Testing Module */}
            <div className="lg:col-span-12 border border-zinc-800 bg-[#0a0a0a] p-4">
              <div className="text-xs uppercase text-zinc-500 border-b border-zinc-800 pb-2 mb-4 flex justify-between">
                <span>Stress Testing (What-If Scenarios)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Revenue Shock ({revenueShock}%)</label>
                    <input type="range" min="-30" max="30" value={revenueShock} onChange={(e) => setRevenueShock(Number(e.target.value))} className="w-full" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Interest Rate Shock ({interestRateShock}%)</label>
                    <input type="range" min="0" max="5" step="0.1" value={interestRateShock} onChange={(e) => setInterestRateShock(Number(e.target.value))} className="w-full" />
                  </div>
                </div>
                
                {(() => {
                  if (!displayAnalysis) return null;
                  return (
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
                        <div className="text-lg text-zinc-200">{(displayAnalysis.ratios.dscr ?? 0).toFixed(2)}</div>
                      </div>
                      <div className="border border-zinc-800 p-3 text-xs">
                        <div className="text-zinc-500 uppercase">Stressed ICR</div>
                        <div className="text-lg text-zinc-200">{(displayAnalysis.ratios.icr ?? 0).toFixed(2)}</div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Industry Benchmarking */}
            <div className="lg:col-span-12 border border-zinc-800 bg-[#0a0a0a] p-4">
              <div className="text-xs uppercase text-zinc-500 border-b border-zinc-800 pb-2 mb-4 flex justify-between">
                <span>Industry Benchmarking ({analysis.companyInfo.industry})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Current Ratio', value: analysis.ratios.currentRatio, benchmark: INDUSTRY_BENCHMARKS[analysis.companyInfo.industry]?.currentRatio || 1.5 },
                  { label: 'Profit Margin', value: analysis.ratios.profitMargin, benchmark: INDUSTRY_BENCHMARKS[analysis.companyInfo.industry]?.profitMargin || 0.1 },
                  { label: 'Leverage (DTI)', value: analysis.ratios.debtToIncome, benchmark: INDUSTRY_BENCHMARKS[analysis.companyInfo.industry]?.debtToEquity || 1.0 },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-400 cursor-help" title={`Company: ${item.value.toFixed(2)} | Benchmark: ${item.benchmark.toFixed(2)}`}>
                      <span>{item.label}</span>
                      <span>{item.value.toFixed(2)} / {item.benchmark.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2 cursor-help" title={`Company: ${item.value.toFixed(2)} | Benchmark: ${item.benchmark.toFixed(2)}`}>
                      <div className="bg-amber-500 h-2 transition-all duration-500" style={{ width: `${Math.min((item.value / (item.benchmark * 2)) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5 Cs Analysis Row */}
            <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-5 gap-2">
              {[
                { label: 'Character', data: displayAnalysis.fiveCs.character, icon: Fingerprint, color: 'text-blue-400' },
                { label: 'Capacity', data: displayAnalysis.fiveCs.capacity, icon: Activity, color: 'text-emerald-400' },
                { label: 'Capital', data: displayAnalysis.fiveCs.capital, icon: Landmark, color: 'text-amber-400' },
                { label: 'Collateral', data: displayAnalysis.fiveCs.collateral, icon: ShieldCheck, color: 'text-purple-400' },
                { label: 'Conditions', data: displayAnalysis.fiveCs.conditions, icon: Globe, color: 'text-cyan-400' },
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
                          {c.data.positiveSignals.slice(0, 2).map((s, j) => <li key={j} className="flex gap-1"><span>+</span>{s}</li>)}
                        </ul>
                      </div>
                    )}
                    {c.data.redFlags.length > 0 && (
                      <div>
                        <div className="text-[9px] text-rose-500 uppercase mb-0.5">Flags</div>
                        <ul className="text-[9px] text-zinc-500 space-y-0.5">
                          {c.data.redFlags.slice(0, 2).map((f, j) => <li key={j} className="flex gap-1"><span>!</span>{f}</li>)}
                          {c.label === 'Character' && analysis.fraudDetection?.filter(f => f.status === 'Fail').slice(0, 1).map((f, j) => (
                            <li key={`fraud-${j}`} className="flex gap-1 text-rose-400 font-bold"><span>!</span>FRAUD: {f.indicator}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {c.label === 'Collateral' && 'assets' in c.data && c.data.assets && (c.data.assets as any[]).length > 0 && (
                      <div className="mt-3 space-y-2 border-t border-zinc-800 pt-2 shrink-0">
                        <div className="text-[9px] text-zinc-500 uppercase mb-1">Liquidable Assets</div>
                        {(c.data.assets as any[]).map((asset, idx) => (
                          <div key={idx} className="bg-zinc-900/50 p-1.5 border border-zinc-800 rounded-sm">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[9px] text-zinc-300 font-medium truncate max-w-[60%]">{asset.type}</span>
                              <span className="text-[9px] text-purple-400 font-bold">{Math.round(asset.ltvRatio * 100)}% LTV</span>
                            </div>
                            <div className="relative h-6 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                              <div 
                                className="absolute inset-y-0 left-0 bg-purple-500/30 transition-all duration-1000" 
                                style={{ width: `${asset.ltvRatio * 100}%` }}
                              />
                              <div className="absolute inset-0 flex items-center justify-between px-2 text-[8px] font-mono">
                                <span className="text-zinc-400">Mkt: ₹{(asset.marketValue / 10000000).toFixed(1)}Cr</span>
                                <span className="text-white font-bold">Liq: ₹{(asset.estimatedValue / 10000000).toFixed(1)}Cr</span>
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

            {/* Middle Row: Financials & Verification */}
            <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-2">
              
              {/* Financial Data */}
              <div className="lg:col-span-1 border border-zinc-800 bg-[#0a0a0a] p-3">
                <div className="text-xs uppercase text-zinc-500 border-b border-zinc-800 pb-1 mb-2 flex justify-between">
                  <span>Financial Metrics (3-Year Trend)</span>
                  <span className="text-zinc-600">INR (₹)</span>
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analysis.structuredData.revenue.map((r, i) => ({
                      year: r.year,
                      Revenue: r.value,
                      Profit: analysis.structuredData.profit[i].value,
                      Debt: analysis.structuredData.debt[i].value
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="year" stroke="#71717a" fontSize={10} />
                      <YAxis stroke="#71717a" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #27272a' }} />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Line type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={2} />
                      <Line type="monotone" dataKey="Profit" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="Debt" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Verification Engine Table */}
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
                            <span className={`px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${
                              item.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                              item.status === 'Mismatch' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                              'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className={`py-2 text-right ${
                            item.confidenceScore >= 80 ? 'text-emerald-500' :
                            item.confidenceScore >= 50 ? 'text-amber-500' : 'text-rose-500'
                          }`}>
                            {item.confidenceScore}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Forensic Fraud Detection Indicators */}
                <div className={`mt-2 border-t pt-3 transition-colors duration-500 ${
                  analysis.shellCompanyAnalysis?.isPotentialShell ? 'border-rose-500/50' : 'border-zinc-800'
                }`}>
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
                        <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Critical Shell Company Risk</div>
                        <div className="text-[9px] text-rose-400/80 leading-tight">High-confidence indicators of a non-operational shell entity detected.</div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {analysis.fraudDetection?.map((check, i) => (
                      <div key={i} className={`p-2 border ${
                        check.status === 'Fail' ? 'border-rose-900/50 bg-rose-950/10' :
                        check.status === 'Warning' ? 'border-amber-900/50 bg-amber-950/10' :
                        'border-zinc-800 bg-zinc-900/30'
                      }`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[9px] uppercase text-zinc-500">{check.category}</span>
                          <span className={`text-[9px] font-bold uppercase ${
                            check.status === 'Fail' ? 'text-rose-500' :
                            check.status === 'Warning' ? 'text-amber-500' : 'text-emerald-500'
                          }`}>
                            {check.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-200 font-medium mb-0.5">{check.indicator}</div>
                        <div className="text-[9px] text-zinc-500 leading-tight mb-1">{check.details}</div>
                        {check.evidence && (
                          <div className="flex items-center gap-1 text-[8px] text-zinc-400 mt-1 pt-1 border-t border-zinc-800/50">
                            <FileSearch className="w-2.5 h-2.5 text-amber-500" />
                            <span className="uppercase tracking-wider font-semibold text-zinc-500">Evidence:</span>
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
                          <span className={`ml-auto px-1.5 py-0.5 rounded-sm text-[8px] font-bold uppercase ${
                            analysis.shellCompanyAnalysis.riskLevel === 'High' ? 'bg-rose-500/20 text-rose-500' :
                            analysis.shellCompanyAnalysis.riskLevel === 'Medium' ? 'bg-amber-500/20 text-amber-500' :
                            'bg-emerald-500/20 text-emerald-500'
                          }`}>
                            {analysis.shellCompanyAnalysis.riskLevel} Risk
                          </span>
                        )}
                      </div>
                      <div className={`border p-3 rounded-sm ${
                        analysis.shellCompanyAnalysis.isPotentialShell 
                          ? 'bg-rose-950/10 border-rose-900/50' 
                          : 'bg-zinc-900/30 border-zinc-800'
                      }`}>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                          <div className="space-y-1">
                            <div className="text-[9px] text-zinc-500 uppercase">Employee Count</div>
                            <div className="text-sm font-medium text-zinc-200">{analysis.shellCompanyAnalysis.employeeCount}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-[9px] text-zinc-500 uppercase">Office Type</div>
                            <div className="text-sm font-medium text-zinc-200">{analysis.shellCompanyAnalysis.officeType}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-[9px] text-zinc-500 uppercase">Potential Shell</div>
                            <div className={`text-sm font-bold ${analysis.shellCompanyAnalysis.isPotentialShell ? 'text-rose-500' : 'text-emerald-500'}`}>
                              {analysis.shellCompanyAnalysis.isPotentialShell ? 'YES' : 'NO'}
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] text-zinc-500 uppercase mb-1">Operational Evidence & Findings</div>
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
                        {analysis.shellCompanyAnalysis.indicators && analysis.shellCompanyAnalysis.indicators.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-zinc-800/50">
                            <div className="text-[9px] text-zinc-500 uppercase mb-2">Detailed Risk Indicators</div>
                            <div className="grid grid-cols-1 gap-2">
                              {analysis.shellCompanyAnalysis.indicators.map((indicator, idx) => (
                                <div key={idx} className={`p-2 border rounded-sm ${
                                  indicator.status === 'Fail' ? 'border-rose-900/50 bg-rose-950/10' :
                                  indicator.status === 'Warning' ? 'border-amber-900/50 bg-amber-950/10' :
                                  'border-zinc-800 bg-zinc-900/30'
                                }`}>
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] text-zinc-200 font-bold">{indicator.name}</span>
                                    <span className={`text-[8px] font-bold uppercase ${
                                      indicator.status === 'Fail' ? 'text-rose-500' :
                                      indicator.status === 'Warning' ? 'text-amber-500' : 'text-emerald-500'
                                    }`}>
                                      {indicator.status}
                                    </span>
                                  </div>
                                  <div className="text-[9px] text-zinc-400 leading-tight mb-1">{indicator.details}</div>
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
                          <span className={`ml-auto px-1.5 py-0.5 rounded-sm text-[8px] font-bold uppercase ${
                            analysis.directorShareholderHistory.riskLevel === 'High' ? 'bg-rose-500/20 text-rose-500' :
                            analysis.directorShareholderHistory.riskLevel === 'Medium' ? 'bg-amber-500/20 text-amber-500' :
                            'bg-emerald-500/20 text-emerald-500'
                          }`}>
                            {analysis.directorShareholderHistory.riskLevel} Volatility
                          </span>
                        )}
                      </div>
                      <div className={`border p-3 rounded-sm ${
                        analysis.directorShareholderHistory.hasRapidChanges 
                          ? 'bg-rose-950/10 border-rose-900/50' 
                          : 'bg-zinc-900/30 border-zinc-800'
                      }`}>
                        <div className="mb-3">
                          <div className="text-[9px] text-zinc-500 uppercase mb-1">Historical Summary</div>
                          <div className="text-[10px] text-zinc-300 leading-relaxed italic border-l-2 border-zinc-700 pl-2">
                            {analysis.directorShareholderHistory.summary}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-[9px] text-zinc-500 uppercase mb-2">Change Events (Last 3-5 Years)</div>
                          <div className="space-y-2">
                            {analysis.directorShareholderHistory.events.map((event, idx) => (
                              <div key={idx} className="bg-zinc-950/40 p-2 border border-zinc-800/50 rounded-sm">
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
                                <div className="text-[10px] text-zinc-300 font-medium mb-0.5">{event.description}</div>
                                {event.reason && (
                                  <div className="text-[9px] text-zinc-500 italic">Reason: {event.reason}</div>
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
            </div>

            {/* Intelligence Row: External, Unstructured, Primary */}
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
                    <div className="text-[10px] text-zinc-500 uppercase mb-1">Legal Disputes (e-Courts)</div>
                    <ul className="list-disc list-inside text-xs text-zinc-300 space-y-0.5">
                      {analysis.externalIntelligence.legalDisputes.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase mb-1">News & Sector Trends</div>
                    <ul className="list-disc list-inside text-xs text-zinc-300 space-y-0.5">
                      {analysis.externalIntelligence.newsSectorTrends.map((item, i) => <li key={i}>{item}</li>)}
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
                    <div className="text-xs text-zinc-300">{analysis.unstructuredInsights.ratingAgencyReports}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase mb-1">Shareholding Pattern</div>
                    <div className="text-xs text-zinc-300">{analysis.unstructuredInsights.shareholdingPattern}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase mb-1">Board Meeting Notes</div>
                    <ul className="list-disc list-inside text-xs text-zinc-300 space-y-0.5">
                      {analysis.unstructuredInsights.boardMeetingNotes.map((item, i) => <li key={i}>{item}</li>)}
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
                      {analysis.primaryInsights.siteVisitObservations.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase mb-1">Management Interviews</div>
                    <ul className="list-disc list-inside text-xs text-zinc-300 space-y-0.5">
                      {analysis.primaryInsights.managementInterviews.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Row: Risk Dimensions & Actions */}
            <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-2">
              
              {/* Risk Dimensions */}
              <div className="lg:col-span-2 border border-zinc-800 bg-[#0a0a0a] p-3">
                <div className="text-xs uppercase text-zinc-500 border-b border-zinc-800 pb-1 mb-3">
                  Risk Dimensions Analysis
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Financial Risk', value: analysis.riskAnalysisDetails.financialRisk, icon: TrendingDown },
                    { label: 'Legal Risk', value: analysis.riskAnalysisDetails.legalRisk, icon: Scale },
                    { label: 'Behavioral Risk', value: analysis.riskAnalysisDetails.behavioralRisk, icon: Activity },
                    { label: 'Industry Risk', value: analysis.riskAnalysisDetails.industryRisk, icon: Building2 },
                    { label: 'Management Risk', value: analysis.riskAnalysisDetails.managementRisk, icon: Users },
                    ...(analysis.fraudDetection?.some(f => f.status !== 'Pass') ? [{
                      label: 'Forensic Fraud Risk',
                      value: `Detected ${analysis.fraudDetection.filter(f => f.status === 'Fail').length} critical flags and ${analysis.fraudDetection.filter(f => f.status === 'Warning').length} warnings in forensic checks.`,
                      icon: ShieldAlert
                    }] : [])
                  ].map((dim, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="mt-0.5 p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400">
                        <dim.icon className="w-3 h-3" />
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500 uppercase mb-0.5">{dim.label}</div>
                        <div className="text-xs text-zinc-300 leading-relaxed">{dim.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Required & Recommendation */}
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
                        {analysis.missingData.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}

                  {analysis.requiredDocs.length > 0 && (
                    <div>
                      <div className="text-[10px] text-amber-400 uppercase mb-1">Required Documents</div>
                      <ul className="list-disc list-inside text-xs text-zinc-400 space-y-0.5">
                        {analysis.requiredDocs.map((item, i) => <li key={i}>{item}</li>)}
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

                <div className={`border p-3 ${
                  analysis.recommendation.includes('Approve') ? 'border-emerald-900 bg-emerald-950/20' :
                  analysis.recommendation.includes('Reject') ? 'border-rose-900 bg-rose-950/20' :
                  'border-amber-900 bg-amber-950/20'
                }`}>
                  <div className="text-xs uppercase text-zinc-500 border-b border-zinc-800/50 pb-1 mb-2">
                    Final Recommendation
                  </div>
                  <div className={`text-lg uppercase tracking-wider mb-2 ${
                    analysis.recommendation.includes('Approve') ? 'text-emerald-500' :
                    analysis.recommendation.includes('Reject') ? 'text-rose-500' :
                    'text-amber-500'
                  }`}>
                    {analysis.recommendation}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {analysis.explanation}
                  </p>
                </div>
              </div>

            </div>

            {/* Fraud Flags */}
            {analysis.fraudFlags.length > 0 && (
              <div className="lg:col-span-12 border border-rose-900 bg-rose-950/10 p-3 mt-2">
                <div className="text-xs uppercase text-rose-500 border-b border-rose-900/50 pb-1 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Critical Risk Flags Detected</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {analysis.fraudFlags.map((flag, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs text-rose-400 bg-rose-950/30 p-2 border border-rose-900/50">
                      <span className="text-rose-500 font-bold">!</span>
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CAM Report Section */}
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
