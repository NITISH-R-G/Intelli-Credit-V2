

  # Intelli-Credit Terminal
  
  **Production-Grade Corporate Credit Appraisal System powered by Google Gemini AI**
</div>

## 🚀 Overview

Intelli-Credit Terminal is an advanced, automated corporate credit appraisal application designed to replicate and enhance professional banking workflows. Built with React, Express, and the Google GenAI SDK, it ingests financial documents, verifies data integrity, detects forensic fraud flags, and generates a comprehensive Credit Appraisal Memo (CAM).

## ✨ Key Features

- **Automated Data Ingestion:** Upload financial documents (PDF, CSV, JSON, TXT, Images). The built-in Express server extracts text and base64 data to feed into the AI engine.
- **Forensic Fraud Detection:** AI-powered identification of shell companies, circular transactions, asset inflation, and director/shareholder inconsistencies.
- **The Five Cs of Credit:** Deep-dive analysis scoring across Character, Capacity, Capital, Collateral, and Conditions.
- **Interactive Stress Testing:** Perform What-If scenarios by applying Revenue and Interest Rate shocks to instantly calculate stressed DSCR, ICR, and revised risk grades.
- **Bureau Integrations:** Support for both simulated (mock) and real external API connections (eCourts, MCA, CIBIL, LTV calculations).
- **Automated CAM Generation:** Instant generation of professional Credit Appraisal Memos with export options to PDF and JSON.

## 🛠 Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide React, Recharts, Framer Motion
- **Backend:** Node.js, Express, Multer, PDF-Parse
- **AI/ML:** Google Gemini 1.5 Pro/Flash (`@google/genai`)
- **Document Generation:** jsPDF, html2canvas, html-to-image, React Markdown

## 📦 Prerequisites

- **Node.js** (v18 or higher)
- **Google Gemini API Key** (Get one from [Google AI Studio](https://aistudio.google.com/))

## ⚙️ Installation & Local Setup

1. **Clone the repository:**


<!-- AUTO-GENERATED-SECTION-START -->
## 🤖 Auto-Generated Repository Analytics


![CI/CD](https://github.com/your-org/your-repo/actions/workflows/ci-cd-automation.yml/badge.svg)
![Repo Analysis](https://github.com/your-org/your-repo/actions/workflows/autonomous-repo-analysis.yml/badge.svg)


### Project Overview
- **Name:** react-example
- **Version:** 0.0.0
- **Detected Frameworks:** React, Express, Vite, TailwindCSS

### Technology Stack & Dependencies
- `@google/genai`
- `@tailwindcss/typography`
- `@tailwindcss/vite`
- `@vitejs/plugin-react`
- `clsx`
- `cors`
- `dotenv`
- `express`
- `html-to-image`
- `html2canvas`
- `jspdf`
- `lucide-react`
- `motion`
- `multer`
- `pdf-parse`
- `react`
- `react-dom`
- `react-dropzone`
- `react-markdown`
- `recharts`
- `tailwind-merge`
- `vite`

### Available Scripts
| Script | Command |
|---|---|
| `npm run dev` | `tsx server.ts` |
| `npm run build` | `vite build` |
| `npm run start` | `node --experimental-strip-types server.ts` |
| `npm run preview` | `vite preview` |
| `npm run clean` | `rm -rf dist` |
| `npm run lint` | `tsc --noEmit` |
| `npm run test` | `vitest run` |
| `npm run test:watch` | `vitest` |
| `npm run analyze:repo` | `tsx scripts/automation/repo-analyzer.ts` |
| `npm run generate:diagrams` | `tsx scripts/automation/generate-diagrams.ts` |
| `npm run generate:readme` | `tsx scripts/automation/generate-readme.ts` |
| `npm run ai:review` | `tsx scripts/automation/ai-reviewer.ts` |

### Environment Variables
| Variable | Example Value |
|---|---|
| `VITE_ECOURTS_API_KEY` | `` |

### Architecture & System Design
# Architecture & Dependencies

This diagram is auto-generated based on the repository structure and dependencies.

```mermaid
graph TD;
  Root["react-example"]
  Root --> Root__env_example[".env.example"]
  Root --> Root__github[".github"]
  Root__github --> Root__github_workflows["workflows"]
  Root__github_workflows --> Root__github_workflows_ai_documentation_agent_yml["ai-documentation-agent.yml"]
  Root__github_workflows --> Root__github_workflows_autonomous_repo_analysis_yml["autonomous-repo-analysis.yml"]
  Root__github_workflows --> Root__github_workflows_ci_cd_automation_yml["ci-cd-automation.yml"]
  Root__github_workflows --> Root__github_workflows_self_updating_readme_yml["self-updating-readme.yml"]
  Root --> Root__gitignore[".gitignore"]
  Root --> Root_README_md["README.md"]
  Root --> Root_cycle_1_report_md["cycle_1_report.md"]
  Root --> Root_cycle_2_report_md["cycle_2_report.md"]
  Root --> Root_cycle_3_report_md["cycle_3_report.md"]
  Root --> Root_cycle_4_report_md["cycle_4_report.md"]
  Root --> Root_cycle_5_report_md["cycle_5_report.md"]
  Root --> Root_cycle_6_report_md["cycle_6_report.md"]
  Root --> Root_dev["dev"]
  Root_dev --> Root_dev_plan_md["plan.md"]
  Root --> Root_docs["docs"]
  Root_docs --> Root_docs_architecture["architecture"]
  Root_docs_architecture --> Root_docs_architecture_dependency_graph_md["dependency-graph.md"]
  Root --> Root_index_html["index.html"]
  Root --> Root_metadata_json["metadata.json"]
  Root --> Root_package_lock_json["package-lock.json"]
  Root --> Root_package_json["package.json"]
  Root --> Root_scripts["scripts"]
  Root_scripts --> Root_scripts_automation["automation"]
  Root_scripts_automation --> Root_scripts_automation_ai_reviewer_ts["ai-reviewer.ts"]
  Root_scripts_automation --> Root_scripts_automation_generate_diagrams_ts["generate-diagrams.ts"]
  Root_scripts_automation --> Root_scripts_automation_generate_readme_ts["generate-readme.ts"]
  Root_scripts_automation --> Root_scripts_automation_repo_analyzer_ts["repo-analyzer.ts"]
  Root --> Root_server_ts["server.ts"]
  Root --> Root_src["src"]
  Root_src --> Root_src_App_tsx["App.tsx"]
  Root_src --> Root_src___tests__["__tests__"]
  Root_src___tests__ --> Root_src___tests___App_test_tsx["App.test.tsx"]
  Root_src --> Root_src_components["components"]
  Root_src_components --> Root_src_components_ActionRecommendation_tsx["ActionRecommendation.tsx"]
  Root_src_components --> Root_src_components_CAMReport_tsx["CAMReport.tsx"]
  Root_src_components --> Root_src_components_CompanyProfile_tsx["CompanyProfile.tsx"]
  Root_src_components --> Root_src_components_DataIngestion_tsx["DataIngestion.tsx"]
  Root_src_components --> Root_src_components_DecisionPanel_tsx["DecisionPanel.tsx"]
  Root_src_components --> Root_src_components_ErrorDisplay_tsx["ErrorDisplay.tsx"]
  Root_src_components --> Root_src_components_FinancialMetrics_tsx["FinancialMetrics.tsx"]
  Root_src_components --> Root_src_components_FiveCsAnalysis_tsx["FiveCsAnalysis.tsx"]
  Root_src_components --> Root_src_components_FraudFlags_tsx["FraudFlags.tsx"]
  Root_src_components --> Root_src_components_IndustryBenchmarking_tsx["IndustryBenchmarking.tsx"]
  Root_src_components --> Root_src_components_IntelligenceRow_tsx["IntelligenceRow.tsx"]
  Root_src_components --> Root_src_components_RiskDimensions_tsx["RiskDimensions.tsx"]
  Root_src_components --> Root_src_components_RiskScorePanel_tsx["RiskScorePanel.tsx"]
  Root_src_components --> Root_src_components_StressTestingModule_tsx["StressTestingModule.tsx"]
  Root_src_components --> Root_src_components_VerificationEngine_tsx["VerificationEngine.tsx"]
  Root_src_components --> Root_src_components___tests__["__tests__"]
  Root_src --> Root_src_constants_ts["constants.ts"]
  Root_src --> Root_src_index_css["index.css"]
  Root_src --> Root_src_lib["lib"]
  Root_src_lib --> Root_src_lib___tests__["__tests__"]
  Root_src_lib --> Root_src_lib_export_ts["export.ts"]
  Root_src_lib --> Root_src_lib_file_utils_test_ts["file-utils.test.ts"]
  Root_src_lib --> Root_src_lib_file_utils_ts["file-utils.ts"]
  Root_src_lib --> Root_src_lib_gemini_config_ts["gemini-config.ts"]
  Root_src_lib --> Root_src_lib_gemini_ts["gemini.ts"]
  Root_src_lib --> Root_src_lib_utils_test_ts["utils.test.ts"]
  Root_src_lib --> Root_src_lib_utils_ts["utils.ts"]
  Root_src --> Root_src_main_tsx["main.tsx"]
  Root_src --> Root_src_services["services"]
  Root_src_services --> Root_src_services___tests__["__tests__"]
  Root_src_services --> Root_src_services_analysisService_ts["analysisService.ts"]
  Root_src --> Root_src_types_ts["types.ts"]
  Root_src --> Root_src_vite_env_d_ts["vite-env.d.ts"]
  Root --> Root_test_pdf_ts["test-pdf.ts"]
  Root --> Root_test_pdf2_ts["test-pdf2.ts"]
  Root --> Root_tsconfig_json["tsconfig.json"]
  Root --> Root_vercel_json["vercel.json"]
  Root --> Root_vite_config_ts["vite.config.ts"]
  subgraph Dependencies
    Root --> Dep__google_genai["@google/genai"]
    Root --> Dep__tailwindcss_typography["@tailwindcss/typography"]
    Root --> Dep__tailwindcss_vite["@tailwindcss/vite"]
    Root --> Dep__vitejs_plugin_react["@vitejs/plugin-react"]
    Root --> Dep_clsx["clsx"]
    Root --> Dep_cors["cors"]
    Root --> Dep_dotenv["dotenv"]
    Root --> Dep_express["express"]
    Root --> Dep_html_to_image["html-to-image"]
    Root --> Dep_html2canvas["html2canvas"]
    Root --> Dep_More["...and 12 more"]
  end
```

### Setup & Deployment Instructions
1. **Install Dependencies:**
   ```bash
   npm ci
   ```
2. **Set Environment Variables:**
   Copy `.env.example` to `.env` and configure appropriately.
3. **Run Application:**
   ```bash
   npm run dev
   ```
4. **Deployment:**
   Configure your deployment target (e.g., Vercel, Node server) to run the `build` script and serve the output directory.

### AI Automated Maintenance
This repository is self-maintaining:
- **CI/CD Automation:** Runs tests, linting, and security audits automatically.
- **Repository Analysis:** Weekly scheduled tasks map the codebase structure.
- **AI Documentation Agent:** An AI automatically reviews PRs and updates documentation based on detected architectural changes.

<!-- AUTO-GENERATED-SECTION-END -->