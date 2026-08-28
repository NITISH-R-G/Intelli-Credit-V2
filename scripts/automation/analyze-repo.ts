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

async function analyzeRepo(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('GEMINI_API_KEY is not set. Gracefully exiting repo analysis.');
    process.exit(0);
  }

  const dirsToScan = ['src', 'api'];
  const allFiles: string[] = [];
  for (const dir of dirsToScan) {
    getFiles(dir, allFiles);
  }

  let codeContext = '';
  for (const file of allFiles) {
    try {
      const content = fs.readFileSync(file, { encoding: 'utf-8' });
      codeContext += `\n--- File: ${file} ---\n${content}\n`;
    } catch (e) {
      console.error(`Failed to read file ${file}:`, e);
    }
  }

  if (!codeContext) {
    console.info('No relevant source code found to analyze.');
    process.exit(0);
  }

  const aiClient = new GoogleGenAI({ apiKey });

  const prompt = `You are a software architect analyzing the following codebase.
Please provide a comprehensive architectural analysis, detailing the system architecture, service maps, data flows, and dependencies. Output in Markdown format.

Code context:
${codeContext}`;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    if (response.text) {
      const outputDir = path.join('docs', 'architecture');
      fs.mkdirSync(outputDir, { recursive: true });
      fs.writeFileSync(path.join(outputDir, 'analysis.md'), response.text, { encoding: 'utf-8' });
      console.info(
        'Successfully generated architectural analysis to docs/architecture/analysis.md',
      );
    } else {
      console.error('Empty response from GenAI.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Failed to generate architectural analysis:', error);
    process.exit(1);
  }
}

void analyzeRepo();
