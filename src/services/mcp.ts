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
