import * as fs from 'node:fs';
import * as path from 'node:path';
import { GoogleGenAI } from '@google/genai';

function getFilesRecursively(dir: string, ext: string[]): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(filePath, ext));
    } else {
      if (ext.some((e) => filePath.endsWith(e))) {
        results.push(filePath);
      }
    }
  }
  return results;
}

async function runImprovementLoop() {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not set. Skipping improvement loop.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // Collect files
  const extensions = ['.ts', '.tsx'];
  let files = [
    ...getFilesRecursively('src', extensions),
    ...getFilesRecursively('api', extensions),
    ...getFilesRecursively('scripts', extensions),
  ];

  // Randomly sample files to avoid context limits
  const maxFiles = 10;
  if (files.length > maxFiles) {
    const shuffled = files.sort(() => 0.5 - Math.random());
    files = shuffled.slice(0, maxFiles);
  }

  let codeContext = '';
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    codeContext += `\n--- ${file} ---\n${content}\n`;
  }

  const prompt = `
  You are an expert AI system architect and maintainer analyzing an open-source codebase.
  Please analyze the following sample of code files and provide a "Continuous Improvement Report".
  Identify potential technical debt, security concerns, architecture improvements, performance issues, or documentation gaps.
  Recommend actionable fixes.

  Code Sample:
  ${codeContext}

  Please format the report cleanly using Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const reportDir = 'docs/history';
    fs.mkdirSync(reportDir, { recursive: true });
    fs.writeFileSync(
      path.join(reportDir, 'ai-improvement-report.md'),
      response.text || 'No issues found.',
    );
    console.info('Continuous improvement report generated successfully.');
  } catch (error) {
    console.error('Error during AI improvement loop:', error);
  }
}

runImprovementLoop().catch(console.error);
