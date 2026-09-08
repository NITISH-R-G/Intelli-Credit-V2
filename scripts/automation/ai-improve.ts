import * as fs from 'node:fs';
import * as path from 'node:path';
import { GoogleGenAI } from '@google/genai';

function getFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      getFiles(path.join(dir, file), fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

async function main(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Skipping continuous improvement.');
    process.exit(0);
  }

  try {
    const directoriesToScan = ['src', 'api', 'scripts'];
    let allFiles: string[] = [];

    for (const dir of directoriesToScan) {
      if (fs.existsSync(dir)) {
        allFiles = allFiles.concat(getFiles(dir));
      }
    }

    // Sample a subset of files to avoid exceeding context window
    const sampledFiles = allFiles.sort(() => 0.5 - Math.random()).slice(0, 10);

    let codeContext = '';
    for (const file of sampledFiles) {
      codeContext += `\n--- ${file} ---\n`;
      codeContext += fs.readFileSync(file, 'utf8');
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a staff-level AI maintainer for the Intelli-Credit Terminal repository.
Your task is to analyze the following randomly sampled codebase files and identify areas for improvement.
Focus on:
1. Technical debt.
2. Architecture and design pattern flaws.
3. Security vulnerabilities.
4. Performance bottlenecks.
5. Missing or outdated documentation.

Code Sample:
${codeContext}

Generate a comprehensive "AI Improvement Report" detailing your findings and providing actionable recommendations.
Format the report as Markdown. Include a summary at the top.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text;
    if (text) {
      fs.mkdirSync('docs/history', { recursive: true });
      fs.writeFileSync('docs/history/ai-improvement-report.md', text, 'utf8');
      console.info('Successfully generated AI improvement report.');
    } else {
      console.warn('AI generated an empty response.');
    }
  } catch (error) {
    console.error('Error during continuous improvement:', error);
    process.exit(1);
  }
}

void main();
