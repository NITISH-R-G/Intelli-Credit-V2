import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

async function improve() {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not found. Skipping AI improvement loop.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `
You are the autonomous AI staff engineer for the Intelli-Credit repository.
Your goal is to analyze the general state of a modern React/Express/Vite/TypeScript application and suggest ONE high-impact improvement.
The repository uses Google Gemini for credit appraisals.
Focus on: Technical Debt, Architecture, Security, Performance, or Contributor Experience.
Provide a clear, actionable recommendation. Include a description and suggested steps to implement it.
Format your output as Markdown suitable for a GitHub Issue body.
Make sure the title is the very first line starting with '# ' (so it can be parsed as a title).
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text || "# Weekly AI Improvement Suggestion\n\nNo suggestions this time.";

    const outDir = path.join(process.cwd(), 'docs', 'history');
    fs.mkdirSync(outDir, { recursive: true });

    const outPath = path.join(process.cwd(), 'ai-improvement-report.md');
    fs.writeFileSync(outPath, text);
    console.info('Improvement report generated successfully.');
  } catch (error) {
    console.error('Error generating improvement report:', error);
    process.exit(0);
  }
}

void improve();
