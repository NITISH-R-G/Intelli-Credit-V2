import * as fs from 'node:fs';
import * as path from 'node:path';
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

async function improveRepo(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is missing. Exiting gracefully.');
    process.exit(0);
  }

  const directoriesToScan = ['src', 'api', 'scripts'];
  let codebaseContent = '';

  for (const dir of directoriesToScan) {
    if (fs.existsSync(dir)) {
      const files = getFiles(dir);
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        codebaseContent += `\n--- ${file} ---\n${content}\n`;
      }
    }
  }

  if (!codebaseContent) {
    console.warn('No source files found to analyze.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
    You are an AI architect analyzing a repository for continuous improvement.
    Review the following key source files and suggest architectural improvements, security enhancements, and technical debt remediation.

    Codebase context:
    ${codebaseContent.substring(0, 80000)} // Ensure we don't exceed token limits roughly

    Output a detailed markdown report with your findings and actionable recommendations.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const reportText =
      response.text ||
      '# AI Improvement Report\n\nNo significant improvements identified at this time.';

    const outDir = 'docs/history';
    fs.mkdirSync(outDir, { recursive: true });

    fs.writeFileSync(path.join(outDir, 'ai-improvement-report.md'), reportText);
    console.info('Improvement report written to docs/history/ai-improvement-report.md');
  } catch (err) {
    console.error('Failed to generate improvement report:', err);
    process.exit(1);
  }
}

void improveRepo();
