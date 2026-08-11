import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

function getFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

async function improveRepo(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('GEMINI_API_KEY is not set. Skipping AI repo improvement loop.');
    process.exit(0);
  }

  const dirsToScan = ['src', 'api', 'scripts'];
  const allFiles: string[] = [];
  for (const dir of dirsToScan) {
    getFiles(dir, allFiles);
  }

  let codeContext = '';
  // Limit to first 20 files to prevent context overload for the script.
  for (const file of allFiles.slice(0, 20)) {
    codeContext += `\n--- ${file} ---\n`;
    codeContext += fs.readFileSync(file, 'utf8');
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `You are an expert AI software engineer analyzing the Intelli-Credit Terminal repository.
Based on the following source code samples, identify areas for improvement. Look for technical debt, security risks, performance issues, and architectural concerns. Generate a structured markdown report detailing your findings and actionable recommendations.

Code Samples:
${codeContext}`,
    });

    const report = response.text;
    fs.writeFileSync(
      'ai-improvement-report.md',
      report || 'No improvement recommendations at this time.',
    );
    console.info('AI Improvement loop completed successfully.');
  } catch (error) {
    console.error('Error during AI Improvement loop:', error);
  }
}

void improveRepo();
