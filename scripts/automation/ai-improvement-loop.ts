import fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function improve() {
  if (!process.env.GEMINI_API_KEY) {
    console.info('GEMINI_API_KEY not found. Skipping AI Improvement Loop.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    const prompt = `You are a senior automated maintainer for Intelli-Credit.
Analyze the general concept of our React and Node.js codebase (Intelli-Credit Terminal).
Generate a daily continuous improvement report.
Suggest 3 specific, actionable improvements focusing on:
1. Technical debt reduction
2. Security posture
3. Contributor experience

Output the report in Markdown format.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text || 'No improvement report generated.';
    fs.writeFileSync('ai-improvement-report.md', report);
    console.info('Improvement report generated successfully.');
  } catch (err) {
    console.error('Error during AI improvement loop:', err);
    process.exit(1);
  }
}

void improve();
