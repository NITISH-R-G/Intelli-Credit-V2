import { Type } from '@google/genai';

export const searchCasesDeclaration = {
  name: "search_cases",
  description: "Search for legal cases and disputes involving a specific company or individual on the eCourts India portal.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: "The name of the company or individual to search for.",
      },
    },
    required: ["query"],
  },
};

export const getMcaInfoDeclaration = {
  name: "get_mca_info",
  description: "Retrieve information from the Ministry of Corporate Affairs (MCA) about a company.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      companyName: {
        type: Type.STRING,
        description: "The name of the company to search for.",
      },
    },
    required: ["companyName"],
  },
};

export const fetchDirectorCibilDeclaration = {
  name: "fetch_director_cibil",
  description: "Fetch the CIBIL credit score for a company director using their name or PAN.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      directorName: {
        type: Type.STRING,
        description: "The name of the director.",
      },
      pan: {
        type: Type.STRING,
        description: "The PAN (Permanent Account Number) of the director.",
      },
    },
    required: ["directorName"],
  },
};

export const calculateLtvDeclaration = {
  name: "calculate_ltv",
  description: "Calculate the estimated liquidable value (Loan-to-Value) for a specific asset type and its current market value.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      assetType: {
        type: Type.STRING,
        description: "The type of asset (e.g., Residential Property, Commercial Property, Machinery, Inventory).",
      },
      marketValue: {
        type: Type.NUMBER,
        description: "The current market value of the asset.",
      },
    },
    required: ["assetType", "marketValue"],
  },
};

export const callMcpTool = async (toolName: string, args: any, apiMode: boolean, bureauApiKey: string) => {
  const apiKey = import.meta.env.VITE_ECOURTS_API_KEY;

  try {
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (toolName === "search_cases") {
      if (!apiKey) {
        return { error: "eCourts API key not configured. Please set VITE_ECOURTS_API_KEY in your environment." };
      }
      return {
        cases: [
          {
            caseNumber: "COM/2023/001",
            court: "High Court",
            status: "Pending",
            summary: `Commercial dispute involving ${args.query || 'the entity'}.`
          }
        ]
      };
    }

    if (toolName === "fetch_director_cibil") {
      if (apiMode && !bureauApiKey) {
        return { error: "Bureau API Key is missing. Please provide a key in the settings panel for Real API mode." };
      }
      if (apiMode && bureauApiKey) {
        try {
          const response = await fetch("https://api.bureau-example.com/v1/cibil", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${bureauApiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(args)
          });
          if (!response.ok) {
            return { error: `Bureau API returned status ${response.status}: ${response.statusText}` };
          }
          return await response.json();
        } catch (error) {
          return { error: "Network error: Failed to reach the Bureau API endpoint. Check your connection." };
        }
      } else {
        return {
          score: 750 + Math.floor(Math.random() * 100),
          status: "Excellent",
          remarks: "Strong credit history with no defaults."
        };
      }
    }

    if (toolName === "calculate_ltv") {
      if (apiMode && !bureauApiKey) {
        return { error: "Bureau API Key is missing. Please provide a key in the settings panel for Real API mode." };
      }
      if (apiMode && bureauApiKey) {
        try {
          const response = await fetch("https://api.bureau-example.com/v1/ltv", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${bureauApiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(args)
          });
          if (!response.ok) {
            return { error: `LTV Calculation API returned status ${response.status}: ${response.statusText}` };
          }
          return await response.json();
        } catch (error) {
          return { error: "Network error: Failed to reach the LTV Calculation API. Check your connection." };
        }
      } else {
        const ltvRatios: Record<string, number> = {
          "Residential Property": 0.8,
          "Commercial Property": 0.7,
          "Machinery": 0.5,
          "Inventory": 0.4
        };
        const ratio = ltvRatios[args.assetType] || 0.5;
        return {
          estimatedValue: args.marketValue * ratio,
          ltvRatio: ratio,
          remarks: `Standard LTV applied for ${args.assetType}.`
        };
      }
    }

    if (toolName === "get_mca_info") {
      if (apiMode && bureauApiKey) {
        try {
          const res = await fetch("/resource/4dbe5667-7b6b-41d7-82af-211562424d9a", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ companyName: args.companyName })
          });
          if (res.ok) return await res.json();

          const getRes = await fetch(`/resource/4dbe5667-7b6b-41d7-82af-211562424d9a?companyName=${encodeURIComponent(args.companyName as string)}`);
          if (getRes.ok) return await getRes.json();

          return { error: `MCA API returned status ${getRes.status}` };
        } catch (e) {
          return { error: "Failed to fetch MCA info from API" };
        }
      } else {
        return {
          status: "Active",
          incorporationDate: "2018-04-15",
          filingStatus: "Compliant",
          lastAnnualGeneralMeeting: "2023-09-30",
          lastBalanceSheetDate: "2023-03-31",
          authorizedCapital: 5000000,
          paidUpCapital: 2500000,
          directors: ["John Doe", "Jane Smith"]
        };
      }
    }

    return { error: "Unknown tool" };
  } catch (error) {
    console.error("Error calling MCP tool:", error);
    return { error: "Tool execution failed" };
  }
};

export const EXTRACTION_PROMPT = `
        Objective:
        You are a Senior Credit Officer at a leading Indian Bank. Your task is to perform a production-grade Corporate Credit Appraisal, replicating a professional bank workflow.

        Forensic Reconciliation: Cross-check the revenue and cash flow figures across the different provided documents (e.g., Bank Statement vs. Tax Return). Flag any numerical discrepancies larger than 5% as a high-risk Fraud Flag.

        1. Data Ingestion & Extraction:
        Extract and synthesize data from the provided documents into four distinct pillars:
        - Structured Data: Financial figures (revenue, debt, cashflow, profit, assets, liabilities) for the last 3 years, formatted as arrays of {year, value} objects.
        - Unstructured Insights: Insights from Annual Reports, Board minutes, Rating reports, Shareholding patterns.
        - External Intelligence: Use 'get_mca_info' for MCA status. Use Google Search for News, and Sector trends. Use 'search_cases' for Legal disputes.
        - Primary Insights: Site visit observations, Management interviews.

        2. Mandatory Verification & Trust Engine:
        Independently validate every data point. Assign a status (Verified/Unverified/Mismatch) and confidence score.
        - Identity (PAN/Aadhaar): Match extracted names with official records (simulate).
        - Business (GST/MCA): Verify registration and filing status using 'get_mca_info'.
        - Legal (eCourts): Use \`search_cases\` for contextual matching.
        - Financial Consistency: Cross-check GST vs Bank vs Declared Revenue. Detect inflation or circular trading.
        - Banking Integrity: Detect tampering or anomalies in statements.
        - Credit History (CIBIL): Validate past repayment behavior (simulate).
        - Collateral: Validate ownership and encumbrances (simulate).

        3. Forensic Fraud Detection:
        Perform deep-dive checks for the following:
        - Circular Transactions: Identify patterns of money moving between related parties with no clear business purpose.
        - Shell Company Indicators: Look for low employee counts relative to revenue, virtual office addresses, or lack of physical operational evidence.
          - Assign 'Fail' if multiple indicators are present (e.g., low employees AND virtual office, or virtual office AND frequent director changes).
          - Assign 'Warning' if only one indicator is present or if there is a lack of demonstrable physical operations (e.g., no site visit evidence, no physical assets in balance sheet).
          - Crucial: Check for a history of frequent, unexplained changes in directors or significant shareholders (e.g., multiple changes within 12-18 months). Flag this as a high-risk shell indicator if combined with low employee count or virtual office address.
          - Refine 'operationalEvidence' to explicitly include:
            - Presence/Absence of physical assets (machinery, property, inventory) on the balance sheet.
            - Explicit mentions of "Virtual Office", "Registered Office Only", or "Co-working space" in official filings (MCA/GST).
            - Discrepancies between declared business activity and physical infrastructure.
          - Populate the 'shellCompanyAnalysis' object with specific details:
            - employeeCount
            - officeType (Physical/Virtual/Co-working)
            - operationalEvidence (list of specific proofs or lack thereof)
            - isPotentialShell (boolean)
            - riskLevel (Low/Medium/High)
            - indicators: A detailed breakdown of each specific shell company indicator found (e.g., "Low Employee Count", "Virtual Office", "Frequent Director Changes", "Lack of Physical Assets"). For each indicator, provide its name, status (Pass/Fail/Warning), details, and the exact evidence (page/line numbers) from the uploaded documents.
        - Director and Shareholder History:
          - Analyze the frequency and reasons for changes in directors and significant shareholders over the last 3-5 years.
          - Identify patterns of rapid, unexplained changes (e.g., multiple changes within 12 months).
          - Populate the 'directorShareholderHistory' object:
            - events: A list of specific change events with date, type (Director/Shareholder), description, reason (if found), and evidence (page/line numbers).
            - summary: A narrative summary of the historical stability or volatility.
            - hasRapidChanges: Boolean flag if rapid/unexplained changes are detected.
            - riskLevel: Low/Medium/High based on the volatility.
        - Director Inconsistencies: Check for directors with multiple DINs, frequent changes in directorship, or involvement in blacklisted entities.
        - Asset Inflation: Verify if collateral values are realistically aligned with market trends.
        - Unusual Transaction Volumes: Flag transaction volumes that are disproportionately high or low relative to the company's stated size, employee count, or industry average.
        - Rapid Ownership/Directorship Changes: Identify frequent changes in key management or shareholding within a short period (e.g., < 12 months) without clear strategic justification.

        For EVERY fraud indicator identified (including those in 'fraudDetection', 'shellCompanyAnalysis', 'directorShareholderHistory', and 'Director Inconsistencies'), you MUST provide 'evidence' which includes specific page numbers, line numbers, or document names from the uploaded documents where the evidence was found (e.g., "Page 4, Line 12", "Bank Statement Oct 2023, Page 2", or "MCA Filing, Page 1"). If evidence is missing, state "Not available in provided documents".

        4. Multi-Dimensional Risk Analysis (The Five Cs of Credit):
        Analyze the borrower across five dimensions:
        - Character: Integrity, reputation, promoter background, past ventures. Use 'fetch_director_cibil' to get the promoter's credit score and history to influence this score.
        - Capacity: Ability to repay, cashflow stability, debt service coverage.
        - Capital: Promoter's skin in the game, net worth, leverage.
        - Collateral: Quality, value, and enforceability of security. Use 'calculate_ltv' for any identified assets to determine their liquidable value and influence this score. Populate the 'assets' array in the 'collateral' section with the results of these calculations.
        - Conditions: Industry trends, regulatory environment, economic factors.
        For each C, provide a score (0-100), key insights, red flags, and positive signals.

        4. Decision Engine:
        Output a final recommendation (Approve/Review/Reject), suggested loan amount, interest rate, and risk grade (e.g., AAA, BBB+, C). Provide detailed reasoning and confidence level.

        Loan Sizing Logic (CRITICAL):
        - The 'suggestedLoanAmount' MUST be a single numeric value in INR (absolute value, e.g., 5000000 for 50 Lakhs).
        - It should NOT exceed 25% of the latest annual revenue.
        - It should NOT exceed 4x the latest annual net profit.
        - If the company is loss-making, the loan amount should be minimal or zero unless there is strong collateral.
        - If multiple documents show conflicting revenue, use the MOST CONSERVATIVE (lowest) figure for calculation.
        - If 'Reject' is recommended, 'suggestedLoanAmount' should be 0.

        5. Credit Appraisal Memo (CAM) Generation:
        Generate a professional, bank-standard CAM report in a formal tone. The CAM report MUST be formatted as a clean, structured Markdown string that can be directly converted into a Word/PDF document.
        Use headings, bullet points, and sections clearly.
        Include the following structure based on the Five Cs of Credit:
        - 1. Executive Summary: Brief overview, loan purpose, final recommendation, key reasons.
        - 2. Company Profile: Name, Industry, Incorporation Year, Business model, Operational status.
        - 3. Character (Credibility & Intent): Promoter credibility, credit history, legal standing, behavioral risks.
        - 4. Capacity (Repayment Ability): Revenue/profit trends, cash flow, debt servicing, key ratios.
        - 5. Capital (Financial Strength): Net worth, assets vs liabilities, debt-to-equity.
        - 6. Collateral (Security): Available collateral, coverage adequacy. If not available, state "Unsecured Exposure".
        - 7. Conditions (External & Industry Factors): Industry outlook, market risks, economic conditions.
        - 8. Forensic Fraud Detection:
          - Use a clear ## H2 heading for this section.
          - Provide a detailed narrative of forensic findings, including circular transactions, director inconsistencies, and unusual transaction volumes.
          - Use bullet points for each major finding, and explicitly cite the evidence (page/line numbers) as previously defined.
          - 8.1. Shell Company Analysis:
            - Use a clear ### H3 heading for this sub-section.
            - Present the analysis in a highly structured format using bold labels and bullet points:
              - **Employee Count Analysis**: [Details vs industry average]
              - **Office Type & Infrastructure**: [Physical/Virtual/Co-working details]
              - **Operational Evidence**:
                - [Bullet point 1: Physical asset verification]
                - [Bullet point 2: Official filing discrepancies]
                - [Bullet point 3: Site visit observations]
              - **Detailed Risk Indicators**:
                - List each specific indicator found (e.g., "Low Employee Count", "Virtual Office", "Frequent Director Changes", "Lack of Physical Assets").
                - For each indicator, include its status (Pass/Fail/Warning), details, and the exact evidence (page/line numbers).
              - **Risk Assessment Conclusion**: [Final verdict on shell potential with risk level]
          - 8.2. Director and Shareholder History:
            - Use a clear ### H3 heading for this sub-section.
            - Analyze the frequency and reasons for changes in directors and significant shareholders over the last 3-5 years.
            - List all major change events in a bulleted list, including date, type, and evidence.
            - Provide a clear risk assessment on whether these changes are indicative of shell company activity or management instability.
        - 9. Risk Analysis Summary: List key risks with evidence, contradictions, categorize risks (Critical/Moderate/Minor).
        - 10. Verification Summary: Present a table-like structured summary (Check performed, Source, Status, Key findings).
        - 11. Final Recommendation: Decision (APPROVE/REVIEW/REJECT), justification based on risk score, verification integrity, financial strength.

        Style Guidelines:
        - Use formal banking language.
        - Be precise and evidence-based.
        - Do NOT use casual tone.
        - Do NOT hallucinate missing data. If missing, state "Not available in provided documents".
        - Every major claim must be backed by data or verification.
        - Highlight any inconsistencies clearly.
        - Prioritize risk clarity over description.
        - Think like a banker approving a multi-crore loan.
        Return a JSON object matching the provided schema.
      `;

export const RESPONSE_SCHEMA = {
          type: Type.OBJECT,
          properties: {
            companyInfo: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                establishedYear: { type: Type.STRING },
                industry: { type: Type.STRING },
                registrationNumber: { type: Type.STRING },
                employees: { type: Type.STRING },
              },
              required: ["name", "establishedYear", "industry", "registrationNumber", "employees"],
            },
            structuredData: {
              type: Type.OBJECT,
              properties: {
                revenue: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { year: { type: Type.STRING }, value: { type: Type.NUMBER } }, required: ["year", "value"] } },
                debt: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { year: { type: Type.STRING }, value: { type: Type.NUMBER } }, required: ["year", "value"] } },
                cashflow: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { year: { type: Type.STRING }, value: { type: Type.NUMBER } }, required: ["year", "value"] } },
                profit: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { year: { type: Type.STRING }, value: { type: Type.NUMBER } }, required: ["year", "value"] } },
                assets: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { year: { type: Type.STRING }, value: { type: Type.NUMBER } }, required: ["year", "value"] } },
                liabilities: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { year: { type: Type.STRING }, value: { type: Type.NUMBER } }, required: ["year", "value"] } },
              },
              required: ["revenue", "debt", "cashflow", "profit", "assets", "liabilities"],
            },
            unstructuredInsights: {
              type: Type.OBJECT,
              properties: {
                boardMeetingNotes: { type: Type.ARRAY, items: { type: Type.STRING } },
                ratingAgencyReports: { type: Type.STRING },
                shareholdingPattern: { type: Type.STRING },
              },
              required: ["boardMeetingNotes", "ratingAgencyReports", "shareholdingPattern"],
            },
            externalIntelligence: {
              type: Type.OBJECT,
              properties: {
                mcaStatus: { type: Type.STRING },
                legalDisputes: { type: Type.ARRAY, items: { type: Type.STRING } },
                newsSectorTrends: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["mcaStatus", "legalDisputes", "newsSectorTrends"],
            },
            primaryInsights: {
              type: Type.OBJECT,
              properties: {
                siteVisitObservations: { type: Type.ARRAY, items: { type: Type.STRING } },
                managementInterviews: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["siteVisitObservations", "managementInterviews"],
            },
            verificationLayer: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  dataPoint: { type: Type.STRING },
                  status: { type: Type.STRING },
                  confidenceScore: { type: Type.NUMBER },
                  source: { type: Type.STRING },
                  notes: { type: Type.STRING },
                },
                required: ["category", "dataPoint", "status", "confidenceScore", "source", "notes"],
              }
            },
            riskAnalysisDetails: {
              type: Type.OBJECT,
              properties: {
                financialRisk: { type: Type.STRING },
                legalRisk: { type: Type.STRING },
                behavioralRisk: { type: Type.STRING },
                industryRisk: { type: Type.STRING },
                managementRisk: { type: Type.STRING },
              },
              required: ["financialRisk", "legalRisk", "behavioralRisk", "industryRisk", "managementRisk"],
            },
            fraudDetection: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  indicator: { type: Type.STRING },
                  status: { type: Type.STRING }, // Pass, Fail, Warning
                  details: { type: Type.STRING },
                  evidence: { type: Type.STRING }, // e.g., "Page 4, Line 12"
                },
                required: ["category", "indicator", "status", "details", "evidence"],
              }
            },
            shellCompanyAnalysis: {
              type: Type.OBJECT,
              properties: {
                employeeCount: { type: Type.NUMBER },
                officeType: { type: Type.STRING },
                operationalEvidence: { type: Type.ARRAY, items: { type: Type.STRING } },
                isPotentialShell: { type: Type.BOOLEAN },
                riskLevel: { type: Type.STRING },
                indicators: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      status: { type: Type.STRING }, // Pass, Fail, Warning
                      details: { type: Type.STRING },
                      evidence: { type: Type.STRING }, // e.g., "Page 4, Line 12"
                    },
                    required: ["name", "status", "details", "evidence"],
                  }
                }
              },
              required: ["employeeCount", "officeType", "operationalEvidence", "isPotentialShell", "riskLevel", "indicators"],
            },
            directorShareholderHistory: {
              type: Type.OBJECT,
              properties: {
                events: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      date: { type: Type.STRING },
                      type: { type: Type.STRING },
                      description: { type: Type.STRING },
                      reason: { type: Type.STRING },
                      evidence: { type: Type.STRING },
                    },
                    required: ["date", "type", "description", "reason", "evidence"],
                  }
                },
                summary: { type: Type.STRING },
                hasRapidChanges: { type: Type.BOOLEAN },
                riskLevel: { type: Type.STRING },
              },
              required: ["events", "summary", "hasRapidChanges", "riskLevel"],
            },
            fiveCs: {
              type: Type.OBJECT,
              properties: {
                character: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    insights: { type: Type.ARRAY, items: { type: Type.STRING } },
                    redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    positiveSignals: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ["score", "insights", "redFlags", "positiveSignals"],
                },
                capacity: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    insights: { type: Type.ARRAY, items: { type: Type.STRING } },
                    redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    positiveSignals: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ["score", "insights", "redFlags", "positiveSignals"],
                },
                capital: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    insights: { type: Type.ARRAY, items: { type: Type.STRING } },
                    redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    positiveSignals: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ["score", "insights", "redFlags", "positiveSignals"],
                },
                collateral: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    insights: { type: Type.ARRAY, items: { type: Type.STRING } },
                    redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    positiveSignals: { type: Type.ARRAY, items: { type: Type.STRING } },
                    assets: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          type: { type: Type.STRING },
                          marketValue: { type: Type.NUMBER },
                          estimatedValue: { type: Type.NUMBER },
                          ltvRatio: { type: Type.NUMBER },
                          remarks: { type: Type.STRING },
                        },
                        required: ["type", "marketValue", "estimatedValue", "ltvRatio", "remarks"],
                      }
                    }
                  },
                  required: ["score", "insights", "redFlags", "positiveSignals"],
                },
                conditions: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    insights: { type: Type.ARRAY, items: { type: Type.STRING } },
                    redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    positiveSignals: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ["score", "insights", "redFlags", "positiveSignals"],
                },
              },
              required: ["character", "capacity", "capital", "collateral", "conditions"],
            },
            camMarkdown: { type: Type.STRING },
            explanation: { type: Type.STRING },
            recommendation: { type: Type.STRING },
            decisionConfidence: { type: Type.NUMBER },
            suggestedLoanAmount: { type: Type.NUMBER },
            suggestedInterestRate: { type: Type.STRING },
            riskGrade: { type: Type.STRING },
            missingData: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            requiredDocs: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: [
            "companyInfo", "structuredData", "unstructuredInsights", "externalIntelligence",
            "primaryInsights", "verificationLayer", "riskAnalysisDetails", "fiveCs", "camMarkdown",
            "explanation", "recommendation", "decisionConfidence", "suggestedLoanAmount",
            "suggestedInterestRate", "riskGrade", "missingData", "requiredDocs"
          ],
        };
