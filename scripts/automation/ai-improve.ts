import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import * as path from 'node:path';

function getFiles(dir: string, ext: string = '.ts'): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(filePath, ext));
    } else if (filePath.endsWith(ext) || filePath.endsWith('.tsx')) {
      results.push(filePath);
    }
  }
  return results;
}

async function improveRepo() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('No GEMINI_API_KEY found, skipping improvement loop.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });

  const dirs = ['src', 'api', 'scripts'];
  let allFiles: string[] = [];
  for (const dir of dirs) {
    allFiles = allFiles.concat(getFiles(dir));
  }

  // Randomly sample files to avoid context limits
  const sampleSize = Math.min(allFiles.length, 10);
  const sampledFiles = allFiles.sort(() => 0.5 - Math.random()).slice(0, sampleSize);

  let codebaseContent = '';
  for (const file of sampledFiles) {
    codebaseContent += `\n\n--- File: ${file} ---\n`;
    codebaseContent += fs.readFileSync(file, 'utf-8');
  }

  const prompt = `
You are an expert AI architect continuously improving the Intelli-Credit repository.
Analyze the following sampled codebase files and identify structural weaknesses, technical debt, security risks, or architectural concerns.

Generate a comprehensive markdown report titled "AI Improvement Report".
Include:
1. Executive Summary
2. Identified Issues
3. Actionable Recommendations
4. Suggested Architecture Changes

Codebase Sample:
${codebaseContent}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    fs.mkdirSync('docs/history', { recursive: true });
    fs.writeFileSync(
      'docs/history/ai-improvement-report.md',
      response.text || '# AI Improvement Report\nNo significant improvements found.',
    );
    console.info('Improvement report generated successfully.');
  } catch (error) {
    console.error('Failed to generate improvement report:', error);
    process.exit(1);
  }
}

void improveRepo();
