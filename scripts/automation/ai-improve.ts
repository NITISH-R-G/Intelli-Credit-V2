import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('GEMINI_API_KEY not found. Skipping AI Continuous Improvement.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

async function improveRepo() {
  try {
    const prompt = `You are an autonomous AI Continuous Improvement agent for an open-source repository.
Your task is to suggest repository improvements.
Think about potential refactoring, test additions, documentation enhancements, automation improvements, security hardening, etc.

Generate a Markdown report detailing 3 actionable recommendations for improving this repository. Include code snippets or configuration examples where appropriate. Output only the Markdown content.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report =
      response.text ||
      '# AI Continuous Improvement Report\n\nNo significant recommendations at this time.';

    fs.writeFileSync('ai-improvement-report.md', report);
    console.info('Improvement report successfully written to ai-improvement-report.md');
  } catch (error) {
    console.error('Failed to generate improvement report:', error);
    process.exit(1);
  }
}

void improveRepo();
