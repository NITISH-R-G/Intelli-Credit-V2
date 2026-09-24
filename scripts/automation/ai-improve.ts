import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach(function (file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

async function improve() {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is missing. Skipping AI Improvement loop.');
    process.exit(0);
  }

  try {
    const srcFiles = fs.existsSync('src') ? getAllFiles('src') : [];
    const apiFiles = fs.existsSync('api') ? getAllFiles('api') : [];
    const scriptFiles = fs.existsSync('scripts') ? getAllFiles('scripts') : [];

    const allFiles = [...srcFiles, ...apiFiles, ...scriptFiles];
    // Simple random sampling: pick 5 files to avoid context limits
    const sampledFiles = allFiles.sort(() => 0.5 - crypto.randomBytes(1)[0] / 255).slice(0, 5);

    let codebaseContext = '';
    for (const file of sampledFiles) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        codebaseContext += `\n--- File: ${file} ---\n${content}\n`;
      } catch (err) {
        console.warn(`Could not read ${file}`, err);
      }
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `You are an AI architect tasked with continuously improving the Intelli-Credit-V2 repository.
Analyze the following sampled files from the codebase.
Identify weaknesses, technical debt, performance issues, architectural concerns, or areas for refactoring.
Generate a structured report with concrete recommendations and potential fixes.

Codebase Sample:
${codebaseContext}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text || 'No improvements suggested at this time.';

    fs.mkdirSync('docs/history', { recursive: true });
    fs.writeFileSync('docs/history/ai-improvement-report.md', report, 'utf-8');
    console.info(
      'AI improvement report successfully written to docs/history/ai-improvement-report.md',
    );
  } catch (err) {
    console.error('Error during AI improvement loop:', err);
    process.exit(1);
  }
}

void improve();
