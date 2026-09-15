import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';

import { execFileSync } from 'node:child_process';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('GEMINI_API_KEY not found. Skipping AI Maintainer.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

async function analyzeRepo() {
  console.info('Starting repository analysis...');

  // Create directories if they don't exist
  fs.mkdirSync('docs/architecture', { recursive: true });
  fs.mkdirSync('docs/history', { recursive: true });

  const files = execFileSync('git', ['ls-tree', '-r', 'HEAD', '--name-only'], { encoding: 'utf-8' })
    .split('\n')
    .filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'));

  let context = 'Repository Files:\n';
  for (const file of files.slice(0, 20)) {
    // Sample up to 20 files for context
    try {
      const content = fs.readFileSync(file, 'utf-8');
      context += `\n--- ${file} ---\n${content.substring(0, 1000)}...\n`; // Truncate for size
    } catch (e) {
      console.warn(`Could not read ${file}`, e);
    }
  }

  const prompt = `
  You are an expert AI software architect and open-source maintainer analyzing a repository.

  Review the following codebase context and provide a structured JSON report detailing:
  1. Technical debt detected.
  2. Potential security risks.
  3. Documentation gaps.
  4. Architectural recommendations.

  Context:
  ${context}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text;
    fs.writeFileSync('docs/history/ai-improvement-report.md', report || 'No report generated.');
    console.info('Analysis complete. Report saved to docs/history/ai-improvement-report.md');
  } catch (e) {
    console.error('Error during AI analysis', e);
  }
}

analyzeRepo().catch((e) => console.error(e));
export {};
