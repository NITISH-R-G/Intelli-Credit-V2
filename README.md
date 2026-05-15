content = """<div align="center">
  <img width="1200" height="475" alt="Intelli-Credit Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

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
