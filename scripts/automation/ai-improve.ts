import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { GoogleGenAI } from '@google/genai';

function getFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        getFiles(path.join(dir, file), fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

async function improve(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('No GEMINI_API_KEY provided. Skipping improvement loop.');
    process.exit(0);
  }

  const directories = ['src', 'api', 'scripts'].filter(dir => fs.existsSync(dir));
  const allFiles = directories.flatMap(dir => getFiles(dir));

  // Pick a random subset to avoid context limit, but always try to include core files
  const coreFiles = allFiles.filter(f => f.includes('App.tsx') || f.includes('analyze-core.ts') || f.includes('analyze.ts'));
  const otherFiles = allFiles.filter(f => !coreFiles.includes(f));

  const sampleSize = 3;
  const sampled = [...coreFiles];
  for (let i = 0; i < sampleSize && otherFiles.length > 0; i++) {
    const idx = Math.floor((crypto.randomBytes(1)[0] / 255) * otherFiles.length); if (idx >= otherFiles.length) continue;
    sampled.push(otherFiles.splice(idx, 1)[0]);
  }

  let codeContext = '';
  for (const file of sampled) {
    if (fs.existsSync(file)) {
       const content = fs.readFileSync(file, 'utf-8');
       codeContext += `\n\n--- ${file} ---\n${content}`;
    }
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are a continuous improvement AI agent for an open-source React/Node repository.
Analyze the following code files and identify areas for improvement.
Look for technical debt, performance optimizations, architectural concerns, or missing documentation.
Provide a concise Markdown report detailing 2-3 specific recommendations. Include code snippets if helpful.

Code:
${codeContext}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    const text = response.text;
    if (text) {
      fs.mkdirSync('docs/history', { recursive: true });
      fs.writeFileSync('docs/history/ai-improvement-report.md', text);
      console.info('Improvement report generated successfully.');
    }
  } catch (error) {
    console.error('Failed to generate improvement report:', error);
    process.exit(0);
  }
}

void improve();
