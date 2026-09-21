import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import * as path from 'node:path';

function getFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (
        !filePath.includes('node_modules') &&
        !filePath.includes('.git') &&
        !filePath.includes('dist')
      ) {
        getFiles(filePath, fileList);
      }
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

async function improve(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Skipping AI Improve.');
    process.exit(0);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const allFiles = getFiles('src');
    // Simple sampling for context size
    const sampleFiles = allFiles.slice(0, 10);
    let codeContext = '';

    for (const file of sampleFiles) {
      codeContext += `\n--- File: ${file} ---\n${fs.readFileSync(file, 'utf8')}\n`;
    }

    const prompt = `Analyze the following codebase files and suggest improvements for architecture, security, and code quality:\n${codeContext}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text;
    if (report) {
      fs.mkdirSync('docs/history', { recursive: true });
      fs.writeFileSync('docs/history/ai-improvement-report.md', report);
      console.info('Improvement report generated.');
    } else {
      console.warn('Empty response from AI.');
    }
  } catch (error) {
    console.error('Error during AI Improve:', error);
    process.exit(1);
  }
}

void improve();
