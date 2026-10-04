import * as fs from 'node:fs';
import * as path from 'node:path';
import { GoogleGenAI } from '@google/genai';

function getFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (['node_modules', '.git', 'dist', 'coverage', '.github'].includes(file)) continue;
      getFiles(filePath, fileList);
    } else {
      if (
        filePath.endsWith('.ts') ||
        filePath.endsWith('.tsx') ||
        filePath.endsWith('.json') ||
        filePath.endsWith('.md')
      ) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Skipping AI Continuous Improvement.');
    process.exit(0);
  }

  try {
    const allFiles = getFiles('.');
    // More targeted sampling: core configuration and a few source files
    const coreFiles = allFiles.filter(
      (f) =>
        f.includes('package.json') ||
        f.includes('vite.config.ts') ||
        f.includes('server.ts') ||
        f.includes('eslint.config'),
    );
    const sourceFiles = allFiles.filter(
      (f) => (f.endsWith('.ts') || f.endsWith('.tsx')) && !coreFiles.includes(f),
    );
    const sampledSource = sourceFiles.sort(() => 0.5 - Math.random()).slice(0, 5);
    const filesToAnalyze = [...coreFiles, ...sampledSource];

    let context = '';
    for (const file of filesToAnalyze) {
      if (fs.existsSync(file)) {
        context += `\n--- File: ${file} ---\n`;
        context += fs.readFileSync(file, 'utf-8');
      }
    }

    const prompt = `You are an AI architect responsible for continuously improving the intelli-credit repository.
    Analyze the following codebase files and identify structural weaknesses, technical debt, security issues, or missing documentation.
    Provide actionable recommendations. Do NOT include basic formatting/linting fixes. Focus on architecture, performance, security, and maintainability.
    Provide a holistic, high-level summary of potential improvements.

    Code Context:
    ${context}
    `;

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const aiText = response.text;
    if (aiText) {
      fs.mkdirSync('docs/history', { recursive: true });
      fs.writeFileSync('docs/history/ai-improvement-report.md', aiText);
      console.info('Improvement report written to docs/history/ai-improvement-report.md');
    }
  } catch (err) {
    console.error('Error during AI improvement analysis:', err);
    process.exit(1);
  }
}

void main();
