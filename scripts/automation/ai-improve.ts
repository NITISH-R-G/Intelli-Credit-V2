import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { GoogleGenAI } from '@google/genai';

function getFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && !file.startsWith('.')) {
        getFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

async function improve(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is missing. Skipping AI improvement.');
    return;
  }

  let contextFiles = '';
  const srcFiles = getFiles('src');
  const apiFiles = getFiles('api');
  const scriptsFiles = getFiles('scripts');
  const allFiles = [...srcFiles, ...apiFiles, ...scriptsFiles];

  // Prioritize core, randomly sample others to avoid context limit
  const sampleSize = Math.min(allFiles.length, 10);
  const shuffled = allFiles.sort(() => crypto.randomBytes(1)[0] / 255 - 0.5);
  const selectedFiles = shuffled.slice(0, sampleSize);

  for (const file of selectedFiles) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      contextFiles += `\n--- ${file} ---\n${content}\n`;
    } catch {
      // Ignore read errors
    }
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are an expert AI maintainer running a continuous improvement loop on the codebase.
Analyze the provided codebase files and detect weaknesses, technical debt, documentation gaps, security risks, performance issues, contributor friction, and architectural concerns.

Here is a sample of the repo:
${contextFiles}

Generate a comprehensive "AI Improvement Report". Format it as a Markdown document.
Detail your findings and recommend specific, actionable fixes or refactors.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    if (response.text) {
      const outDir = 'docs/history';
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, 'ai-improvement-report.md'), response.text, 'utf-8');
      console.info('Improvement report generated successfully.');
    } else {
      console.warn('AI generated empty response for improvement report.');
    }
  } catch (error) {
    console.error('Error generating AI improvement report:', error);
    process.exitCode = 1;
    return;
  }
}

void improve();
