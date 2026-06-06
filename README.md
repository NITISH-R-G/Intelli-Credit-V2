

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
- **Name:** Intelli-Credit
- **Version:** 0.0.0
- **Detected Frameworks:** None detected

### Technology Stack & Dependencies
*No dependencies found*

### Available Scripts


### Environment Variables
| Variable | Example Value |
|---|---|
| `VITE_ECOURTS_API_KEY` | `` |

### Architecture & System Design
# Architecture & Dependencies

This diagram is auto-generated based on the repository structure and dependencies.

```mermaid
graph TD;
  Root["Intelli-Credit"]
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