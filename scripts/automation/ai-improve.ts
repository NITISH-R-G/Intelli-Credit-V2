import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

function getFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else {
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
         fileList.push(filePath);
      }
    }
  }
  return fileList;
}

async function improve() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is missing');
    process.exit(0);
  }

  try {
    const srcFiles = getFiles('src');
    const apiFiles = getFiles('api');
    const scriptFiles = getFiles('scripts');

    let allFiles = [...srcFiles, ...apiFiles, ...scriptFiles];
    // Securely sample files to avoid context limits
    allFiles = allFiles.sort(() => (crypto.randomBytes(1)[0] / 255) - 0.5).slice(0, 10);

    let codeContext = '';
    for (const file of allFiles) {
       codeContext += `\n--- File: ${file} ---\n`;
       codeContext += fs.readFileSync(file, 'utf8').substring(0, 2000); // sample content
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a senior AI staff engineer performing a continuous improvement analysis of the codebase.
Based on the following sampled files, please generate an improvement report identifying technical debt, architectural concerns, and actionable refactoring recommendations.
Respond strictly in Markdown format, starting with an H1 (# AI Improvement Report - [Date]).

Code context:
${codeContext}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text;
    if (report) {
      const outputDir = 'docs/history';
      fs.mkdirSync(outputDir, { recursive: true });
      fs.writeFileSync(path.join(outputDir, 'ai-improvement-report.md'), report);
      console.info('Improvement report generated successfully.');
    }
  } catch (error) {
    console.error('Error during AI improvement analysis:', error);
    process.exit(0);
  }
}

void improve();
