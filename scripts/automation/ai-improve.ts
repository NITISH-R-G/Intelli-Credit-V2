import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import { getAllCodeFilesContent } from './utils.js';

async function improveRepo() {
  if (!process.env.GEMINI_API_KEY) {
    console.info('GEMINI_API_KEY not found. Skipping AI Improvement Loop.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const allCode = getAllCodeFilesContent();

  const prompt = `You are an AI architect analyzing a repository. Review the following code and suggest architecture improvements, identify technical debt, or recommend optimizations.

Code:
${allCode.substring(0, 500000)} // Limiting to avoid token overflow, assuming moderate size for now.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text;
    fs.writeFileSync('ai-improvement-report.md', report || 'No recommendations generated.');
    console.info('AI Improvement Report generated successfully.');
  } catch (error) {
    console.error('Error generating AI Improvement Report:', error);
    process.exit(1);
  }
}

void improveRepo();
