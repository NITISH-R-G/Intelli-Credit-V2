import React from "react";
import { CreditAnalysis } from '../types';
import { INDUSTRY_BENCHMARKS } from '../constants';
import { AppError } from "../types";
import { hashFile, fileToBase64, fileToText } from '../lib/file-utils';
import { callMcpTool } from '../lib/gemini';
import { searchCasesDeclaration, getMcaInfoDeclaration, fetchDirectorCibilDeclaration, calculateLtvDeclaration, EXTRACTION_PROMPT, RESPONSE_SCHEMA } from '../lib/gemini-config';
import { GoogleGenAI } from '@google/genai';

interface StressedFinancials {
  stressedRevenue: number;
  stressedProfit: number;
  stressedInterest: number;
  stressedCashflow: number;
  stressedProfitMargin: number;
  stressedDebtToIncome: number;
  stressedDSCR: number;
  stressedICR: number;
}

const getStressedFinancials = (
  analysis: CreditAnalysis,
  revenueShock: number,
  interestRateShock: number,
  lastIdx: number
): StressedFinancials => {
  const baseRevenue = analysis.structuredData.revenue[lastIdx].value;
  const baseProfit = analysis.structuredData.profit[lastIdx].value;
  const baseDebt = analysis.structuredData.debt[lastIdx].value;
  const baseInterestRate = parseFloat(analysis.suggestedInterestRate.replace('%', '')) / 100;

  const stressedRevenue = baseRevenue * (1 + revenueShock / 100);
  const stressedProfit = baseProfit * (1 + revenueShock / 100);
  const stressedInterest = baseDebt * (baseInterestRate + interestRateShock / 100);
  const stressedCashflow = stressedProfit - stressedInterest;

  const stressedProfitMargin = stressedRevenue > 0 ? (stressedProfit - stressedInterest) / stressedRevenue : 0;
  const stressedDebtToIncome = stressedRevenue > 0 ? baseDebt / stressedRevenue : 0;

  const estimatedPrincipal = baseDebt * 0.1;
  const stressedDSCR = (stressedInterest + estimatedPrincipal) > 0 ? stressedCashflow / (stressedInterest + estimatedPrincipal) : 0;
  const stressedICR = stressedInterest > 0 ? stressedProfit / stressedInterest : 0;

  return {
    stressedRevenue,
    stressedProfit,
    stressedInterest,
    stressedCashflow,
    stressedProfitMargin,
    stressedDebtToIncome,
    stressedDSCR,
    stressedICR
  };
};

const calculateStressedRiskScore = (
  analysis: CreditAnalysis,
  financials: StressedFinancials
): number => {
  const industry = analysis.companyInfo.industry;
  const benchmark = INDUSTRY_BENCHMARKS[industry] || INDUSTRY_BENCHMARKS['Manufacturing'];

  let stressedRiskScore = 50;

  if (financials.stressedDSCR < 1.0) stressedRiskScore += 30;
  else if (financials.stressedDSCR < 1.25) stressedRiskScore += 15;

  if (financials.stressedICR < 1.5) stressedRiskScore += 20;

  if (financials.stressedProfitMargin < benchmark.profitMargin) stressedRiskScore += 15;
  if (financials.stressedDebtToIncome > benchmark.debtToEquity) stressedRiskScore += 15;

  const criticalFraudCount = analysis.fraudDetection?.filter(f => f.status === 'Fail').length || 0;
  const warningFraudCount = analysis.fraudDetection?.filter(f => f.status === 'Warning').length || 0;
  stressedRiskScore += (criticalFraudCount * 25) + (warningFraudCount * 10);

  return Math.min(Math.max(stressedRiskScore, 0), 100);
};

const getRiskGradeAndRecommendation = (riskScore: number): {
  riskGrade: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  recommendation: string;
} => {
  if (riskScore > 85) {
    return { riskGrade: "C", riskLevel: "Critical", recommendation: "Reject" };
  } else if (riskScore > 60) {
    return { riskGrade: "BB", riskLevel: "High", recommendation: "Refer for Review" };
  } else if (riskScore > 30) {
    return { riskGrade: "BBB", riskLevel: "Medium", recommendation: "Approve with Conditions" };
  }
  return { riskGrade: "AAA", riskLevel: "Low", recommendation: "Approve" };
};

const parseBaseLoanAmount = (analysis: CreditAnalysis): number => {
  if (typeof analysis.suggestedLoanAmount === 'string') {
    const numbers = analysis.suggestedLoanAmount.match(/\d+(\.\d+)?/g);
    if (numbers && numbers.length > 0) {
      let baseLoanAmount = parseFloat(numbers[0]);
      const lowerStr = analysis.suggestedLoanAmount.toLowerCase();
      if (lowerStr.includes('cr') || lowerStr.includes('crore')) baseLoanAmount *= 10000000;
      else if (lowerStr.includes('lakh')) baseLoanAmount *= 100000;
      return baseLoanAmount;
    }
  }
  return 0;
};

export const calculateDisplayAnalysis = (
  analysis: CreditAnalysis | null,
  revenueShock: number,
  interestRateShock: number
): CreditAnalysis | null => {
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

  const lastIdx = analysis.structuredData.revenue.length - 1;
  const financials = getStressedFinancials(analysis, revenueShock, interestRateShock, lastIdx);

  const stressedRiskScore = calculateStressedRiskScore(analysis, financials);
  const { riskGrade: stressedRiskGrade, riskLevel: stressedRiskLevel, recommendation: stressedRecommendation } = getRiskGradeAndRecommendation(stressedRiskScore);

  const shockFactor = Math.abs(revenueShock) / 100 + Math.abs(interestRateShock) / 5;
  const stressedConfidence = Math.max(analysis.decisionConfidence - Math.round(shockFactor * 50), 20);

  const baseLoanAmount = parseBaseLoanAmount(analysis);

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
      debtToIncome: financials.stressedDebtToIncome,
      profitMargin: financials.stressedProfitMargin,
      dscr: financials.stressedDSCR,
      icr: financials.stressedICR
    },
    structuredData: {
      ...analysis.structuredData,
      cashflow: analysis.structuredData.cashflow.map((c, i) => i === lastIdx ? { ...c, value: financials.stressedCashflow } : c),
      profit: analysis.structuredData.profit.map((p, i) => i === lastIdx ? { ...p, value: financials.stressedProfit } : p),
    },
    fiveCs: {
      ...analysis.fiveCs,
      capacity: {
        ...analysis.fiveCs.capacity,
        score: Math.min(Math.max(analysis.fiveCs.capacity.score - (financials.stressedDSCR < 1.2 ? 20 : 0), 0), 100)
      },
      capital: {
        ...analysis.fiveCs.capital,
        score: Math.min(Math.max(analysis.fiveCs.capital.score - (financials.stressedDebtToIncome > 0.8 ? 20 : 0), 0), 100)
      }
    }
  };
};


export const calculateRiskAndFraud = (parsedData: any): CreditAnalysis => {
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
    const aiFraudFails = parsedData.fraudDetection?.filter((f: any) => f.status === 'Fail').length || 0;
    const aiFraudWarnings = parsedData.fraudDetection?.filter((f: any) => f.status === 'Warning').length || 0;
    riskScore += (aiFraudFails * 20);
    riskScore += (aiFraudWarnings * 10);

    // Specific Shell Company Penalty
    const shellIndicators = parsedData.fraudDetection?.filter((f: any) =>
      f.indicator.toLowerCase().includes('shell') ||
      f.details.toLowerCase().includes('virtual office') ||
      f.details.toLowerCase().includes('low employee') ||
      f.details.toLowerCase().includes('director change') ||
      f.details.toLowerCase().includes('shareholder change')
    ) || [];
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
  return result;
};

export const executeAIExtractionLoop = async (
  genAI: any,
  model: string,
  currentContents: any[],
  config: any,
  apiMode: boolean,
  bureauApiKey: string
): Promise<any> => {
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
  return parsedData;
};

export const prepareDocumentContents = async (files: File[]): Promise<any[]> => {
    const promises = files.map(async (f) => {
      if (f.type === "application/pdf" || f.type.startsWith("image/")) {
        const base64Data = await fileToBase64(f);
        return {
          role: "user",
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: f.type,
              },
            },
          ],
        };
      } else {
        const text = await fileToText(f);
        return {
          role: "user",
          parts: [
            {
              text: `Document Name: ${f.name}\n\nDocument Text:\n${text.substring(0, 10000)}`,
            },
          ],
        };
      }
    });

    let currentContents: any[] = await Promise.all(promises);

    // Add the extraction prompt to the last content part
    if (currentContents.length > 0) {
      currentContents[currentContents.length - 1].parts.push({ text: EXTRACTION_PROMPT });
    } else {
      throw new Error("No valid documents found for analysis.");
    }
  return currentContents;
};

export const performAnalysis = async (
  files: File[],
  fileCache: React.MutableRefObject<Map<string, CreditAnalysis>>,
  apiMode: boolean,
  bureauApiKey: string,
  setLoading: (loading: boolean) => void,
  setError: (error: AppError | null) => void,
  setAnalysis: (analysis: CreditAnalysis) => void,
  setShowLogs: (showLogs: boolean) => void
) => {
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

    let currentContents = await prepareDocumentContents(files);

    const parsedData = await executeAIExtractionLoop(genAI, model, currentContents, config, apiMode, bureauApiKey);

    const result = calculateRiskAndFraud(parsedData);

    fileCache.current.set(combinedHash, result);
    setAnalysis(result);
  } catch (err) {
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
