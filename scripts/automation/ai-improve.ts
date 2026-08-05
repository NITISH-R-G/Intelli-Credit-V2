import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import { getRepositoryContext } from './utils';

async function improveRepo() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('GEMINI_API_KEY is not set. Exiting gracefully.');
    process.exit(0);
  }

  const { fileTree, codeContext } = getRepositoryContext();

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert AI Maintainer analyzing a repository to suggest continuous improvements.
Review the file structure and source code to suggest areas for architectural improvements, security enhancements, and technical debt reduction.

Files in repo:
${fileTree}

Source Code Context:
${codeContext}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text;
    fs.writeFileSync('ai-improvement-report.md', report);
    console.info('Improvement report generated successfully.');
  } catch (err) {
    console.error('Failed to generate AI response:', err);
    process.exit(1);
  }
}

void improveRepo();
