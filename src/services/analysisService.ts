import { GoogleGenAI } from '@google/genai';
import { CreditAnalysis, AppError } from '../types';
import { hashFile, fileToBase64, fileToText } from '../lib/file-utils';
import { searchCasesDeclaration, getMcaInfoDeclaration, fetchDirectorCibilDeclaration, calculateLtvDeclaration, callMcpTool, EXTRACTION_PROMPT, RESPONSE_SCHEMA } from '../lib/gemini';

export const handleAnalyzeService = async (
  files: File[],
  apiMode: boolean,
  bureauApiKey: string,
  fileCache: Map<string, CreditAnalysis>
): Promise<{ result?: CreditAnalysis, error?: AppError }> => {
  try {
    const fileHashes = await Promise.all(files.map(hashFile));
    const combinedHash = fileHashes.join('');

    if (fileCache.has(combinedHash)) {
      return { result: fileCache.get(combinedHash)! };
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

      fileCache.set(combinedHash, result);
    return { result };
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
    return { error: appError };
  }
};
