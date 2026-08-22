import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';

import * as path from 'path';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.info('GEMINI_API_KEY missing, skipping improvement loop.');
  process.exit(0);
}

function getSourceFiles(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('dist')) {
        results = results.concat(getSourceFiles(file));
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

async function improve(): Promise<void> {
  const files = getSourceFiles(path.resolve('./src'))
    .concat(getSourceFiles(path.resolve('./api')))
    .concat(getSourceFiles(path.resolve('./scripts')));
  let context = '';
  for (const file of files.slice(0, 10)) {
    // limit size for prompt
    try {
      context += `File: ${file}\n${fs.readFileSync(file, 'utf8')}\n\n`;
    } catch (e) {
      console.error('Error reading file', e);
    }
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `Analyze the following codebase and suggest improvements (security, performance, technical debt, code quality). Provide specific actionable feedback.
${context}`,
  });

  const report = response.text || 'No improvements found.';
  fs.mkdirSync('docs/history', { recursive: true });
  fs.writeFileSync('docs/history/ai-improvement-report.md', report);
}

void improve();
