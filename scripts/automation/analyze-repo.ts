import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import { getRepositoryContext } from './utils';

async function analyzeRepo() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('GEMINI_API_KEY is not set. Exiting gracefully.');
    process.exit(0);
  }

  const { fileTree, codeContext, packageJsonStr } = getRepositoryContext();

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert Software Architect. Analyze the following repository structure, package.json, and source code to generate a high-level architecture overview.

package.json:
${packageJsonStr}

Files:
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
    fs.mkdirSync('docs/architecture', { recursive: true });
    fs.writeFileSync('docs/architecture/ARCHITECTURE_SUMMARY.md', report);
    console.info('Architecture summary generated successfully.');
  } catch (err) {
    console.error('Failed to generate AI response:', err);
    process.exit(1);
  }
}

void analyzeRepo();
