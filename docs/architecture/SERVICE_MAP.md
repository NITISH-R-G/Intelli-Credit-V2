# Service Map

How data and dependencies flow through Intelli-Credit. The defining
architectural fact is the **client / serverless split**: the browser never
holds the Gemini key — all AI and bureau access is proxied through the
`/api/analyze` Vercel serverless function (mirrored locally by `server.ts`).

```mermaid
graph TD
  subgraph Client["Browser (Vite SPA — src/)"]
    App["App.tsx"]
    AS["services/analysisService.ts<br/>(risk math + fetch adapter)"]
    App -->|"performAnalysis()"| AS
  end

  subgraph Serverless["Server (api/ — Vercel function + dev mirror)"]
    Analyze["api/analyze.ts<br/>POST /api/analyze"]
    Core["api/_lib/analyze-core.ts<br/>runAnalysis() — agentic loop"]
    Tools["api/_lib/mcp-tools.ts<br/>bureau / MCA / eCourts tools"]
    Limits["api/_lib/limits.ts<br/>upload validation"]
    Analyze --> Limits
    Analyze --> Core
    Core --> Tools
  end

  subgraph External["External (server-side only)"]
    Gemini["Google Gemini<br/>process.env.GEMINI_API_KEY"]
    Bureau["Bureau / MCA / eCourts APIs"]
    Tools --> Bureau
    Core --> Gemini
  end

  AS -->|"multipart upload<br/>(files + apiMode + bureauApiKey)"| Analyze
  Analyze -->|"{ analysis }"| AS

  subgraph Shared["Shared, pure data (imported by both sides)"]
    Config["src/lib/gemini-config.ts<br/>prompt + schema + tool decls"]
  end
  Core --> Config
```

## Key invariants

- **Secrets never cross to the client.** `GEMINI_API_KEY` and `ECOURTS_API_KEY`
  are read from `process.env` only inside `api/_lib/*` and `server.ts`.
- **One core, two hosts.** `runAnalysis` is environment-agnostic; both the
  production function (`api/analyze.ts`) and the dev harness (`server.ts`)
  call it, so dev and prod behavior are identical.
- **Client keeps the cheap math.** `calculateRiskAndFraud` and
  `calculateDisplayAnalysis` (stress testing) are pure functions that run in
  the browser on the analysis JSON returned by the server.

