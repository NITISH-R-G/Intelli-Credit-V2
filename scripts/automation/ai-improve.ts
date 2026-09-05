import * as fs from 'node:fs';
import * as path from 'node:path';
import { GoogleGenAI } from '@google/genai';

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

async function improve(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Skipping repository improvement analysis.');
    process.exit(0);
  }

  const dirsToScan = ['src', 'api', 'scripts'];
  const allFiles: string[] = [];
  for (const dir of dirsToScan) {
    getFiles(dir, allFiles);
  }

  // Shuffle and pick a sample to avoid context limits
  const sampleSize = Math.min(allFiles.length, 10);
  const sampledFiles = allFiles.sort(() => 0.5 - Math.random()).slice(0, sampleSize);

  let codebaseContext = '';
  for (const file of sampledFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      codebaseContext += `\n--- File: ${file} ---\n${content}\n`;
    } catch (e) {
      console.warn(`Could not read ${file}`);
    }
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are an AI architect analyzing a repository for continuous improvement.
Based on the following code sample, identify technical debt, documentation gaps, security risks, performance issues, and architectural concerns.
Provide actionable recommendations in Markdown format.

Code Sample:
${codebaseContext}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const outputDir = 'docs/history';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(outputDir, 'ai-improvement-report.md'),
      response.text ?? 'No recommendations generated.',
    );
    console.info('Improvement report generated successfully.');
  } catch (error) {
    console.error('Failed to generate improvement report:', error);
    process.exit(1);
  }
}

void improve();
