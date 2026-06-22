<div align="center">

# Intelli-Credit Terminal

**Production-grade corporate credit appraisal, powered by Google Gemini AI.**

[![CI](https://github.com/NITISH-R-G/Intelli-Credit-V2/actions/workflows/ci-cd-automation.yml/badge.svg)](https://github.com/NITISH-R-G/Intelli-Credit-V2/actions/workflows/ci-cd-automation.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](package.json)
[![Tests](https://github.com/NITISH-R-G/Intelli-Credit-V2/actions/workflows/ci-cd-automation.yml/badge.svg)](https://github.com/NITISH-R-G/Intelli-Credit-V2/actions/workflows/ci-cd-automation.yml)

Ingest financial documents → verify, stress-test, and score creditworthiness → generate a bank-standard Credit Appraisal Memo.

[Features](#-features) · [Quick start](#-quick-start) · [How it works](#-how-it-works) · [Deploy](#-deploy-to-vercel) · [Contributing](#-contributing)

</div>

---

## 📋 What is this?

Intelli-Credit Terminal is an automated **corporate credit appraisal** system.
It replicates and enhances professional banking workflows: it ingests a
borrower's financial documents, cross-verifies the data, runs forensic fraud
detection, scores the borrower across the Five Cs of Credit, performs
interactive stress testing, and produces a comprehensive **Credit Appraisal
Memo (CAM)** — the document a credit officer would write by hand.

## ✨ Features

- **Document ingestion** — Upload PDF, CSV, JSON, TXT, and images. The
  serverless API extracts and forwards them to the model.
- **Forensic fraud detection** — AI-powered identification of shell companies,
  circular transactions, asset inflation, and director/shareholder anomalies.
- **The Five Cs of Credit** — Scored analysis across Character, Capacity,
  Capital, Collateral, and Conditions.
- **Interactive stress testing** — Apply revenue and interest-rate shocks and
  instantly see stressed DSCR, ICR, and revised risk grades.
- **Bureau & registry integrations** — Pluggable simulated (mock) and real
  external calls for eCourts, MCA, CIBIL, and LTV calculations.
- **Automated CAM generation** — A professional, exportable memo (PDF / JSON)
  with evidence-backed findings.

## 🏗 Tech stack

- **Client:** React 19, Vite, Tailwind CSS v4, Recharts, Framer Motion, Lucide
- **Server:** Vercel Node.js serverless functions (Web `Request`/`Response`).
  A local Express dev harness (`server.ts`) mirrors the same analysis core.
- **AI:** Google Gemini (`@google/genai`, model `gemini-3-flash-preview`) with
  function-calling tools and Google Search grounding.
- **Document export:** jsPDF, html2canvas, html-to-image, React Markdown.

> **Security model:** the Gemini key and all third-party credentials live
> **server-side only**. The client never sees a secret — every AI/bureau call
> is proxied through `POST /api/analyze`. See
> [`docs/architecture/SERVICE_MAP.md`](docs/architecture/SERVICE_MAP.md).

## 🚀 Quick start

**Prerequisites:** [Node.js](https://nodejs.org/) **>= 20** and a free
[Gemini API key](https://aistudio.google.com/apikey).

```bash
# 1. Clone
git clone https://github.com/NITISH-R-G/Intelli-Credit-V2.git
cd Intelli-Credit-V2

# 2. Install
npm ci

# 3. Configure (add your GEMINI_API_KEY)
cp .env.example .env

# 4. Run the dev server (Vite SPA + local /api/analyze on http://localhost:3000)
npm run dev
```

Open <http://localhost:3000>, upload a financial document, and run an analysis.

## 🔧 How it works

```
Browser ──POST /api/analyze (files + settings)──▶ api/analyze.ts
                                                        │
                                                        ▼
                              api/_lib/analyze-core.ts  (agentic loop:
                              up to 10 Gemini calls + tool dispatch)
                                                        │
                              api/_lib/mcp-tools.ts ◀───┘ (bureau / MCA / eCourts)
                                                        │
                              Google Gemini  ◀──────────┘
                                                        │
                              { analysis }  ◀───────────┘
Browser ◀──────── JSON ──────────────────────────────┘
   │
   └─▶ calculateRiskAndFraud() (pure client math) ──▶ UI
```

The same `runAnalysis` core is used by **both** the Vercel function and the
local dev server, so dev and prod behavior are identical. The browser keeps the
cheap post-processing (risk scoring, stress testing, export) and never holds a
key. Full details in
[`docs/architecture/SERVICE_MAP.md`](docs/architecture/SERVICE_MAP.md).

## ☁️ Deploy to Vercel

1. Push the repo to GitHub.
2. Import it into [Vercel](https://vercel.com/) — the included `vercel.json`
   is detected automatically (Vite framework, `/api` functions, security
   headers, 60s `maxDuration`).
3. In **Settings → Environment Variables**, add:
   - `GEMINI_API_KEY` — **required** (your Gemini key)
   - `ECOURTS_API_KEY` — optional (enables the eCourts `search_cases` tool)
   - `ANALYZE_SECRET` — optional (if set, callers must send it in the
     `x-analyze-secret` header; gates the public endpoint)
4. Deploy. The API key never reaches the client bundle.

## 🧪 Development

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
npm run test        # vitest run
npm run build       # vite build
npm run format      # prettier --write .
```

CI runs `typecheck`, `lint`, `test`, and `build` on every pull request.

## 🤝 Contributing

Contributions are welcome! Read [`CONTRIBUTING.md`](CONTRIBUTING.md) for setup,
coding standards, commit conventions, and the label/triage process. Good first
steps: issues labeled
[`good first issue`](https://github.com/NITISH-R-G/Intelli-Credit-V2/labels/good%20first%20issue)
and
[`help wanted`](https://github.com/NITISH-R-G/Intelli-Credit-V2/labels/help%20wanted).

## 🔒 Security

Found a vulnerability? Please report it privately via
[GitHub Security Advisories](https://github.com/NITISH-R-G/Intelli-Credit-V2/security/advisories/new) —
**do not** open a public issue. See [`SECURITY.md`](SECURITY.md) for the full
policy and response SLA.

## 📄 License

[MIT](LICENSE) © NITISH-R-G.

## 🙏 Acknowledgements

Built with [Google Gemini](https://ai.google.dev/), [React](https://react.dev/),
[Vite](https://vite.dev/), and [Tailwind CSS](https://tailwindcss.com/).
