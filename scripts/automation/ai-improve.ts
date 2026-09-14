import * as fs from 'node:fs';
import * as path from 'node:path';
import { GoogleGenAI } from '@google/genai';

function getFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (['node_modules', 'dist', '.git'].includes(file)) continue;
      getFiles(filePath, fileList);
    } else {
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

function getRandomFiles(files: string[], count: number): string[] {
  const shuffled = files.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function improveRepo() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Skipping repo improvement analysis.');
    process.exit(0);
  }

  const allFiles = getFiles('src');
  const sampledFiles = getRandomFiles(allFiles, 10);

  let codeContext = '';
  for (const file of sampledFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    codeContext += `\n\n--- File: ${file} ---\n${content}\n`;
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = `You are a senior AI architect. Analyze the following sample of the repository's codebase and suggest continuous improvements.
Look for:
- Technical debt
- Security risks
- Performance issues
- Architectural concerns
- Code quality improvements

Provide a structured markdown report with your findings and actionable recommendations.

Codebase Sample:
${codeContext}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const aiResponse = response.text || 'No improvement recommendations generated.';

    fs.mkdirSync('docs/history', { recursive: true });

    const reportContent = `---
title: Daily AI Continuous Improvement Report
labels: enhancement, ai-generated
---
# AI Repository Analysis Report

${aiResponse}
`;

    fs.writeFileSync('docs/history/ai-improvement-report.md', reportContent);
    console.info('Improvement report generated successfully.');
  } catch (error) {
    console.error('Error generating improvement report:', error);
    process.exit(1);
  }
}

void improveRepo();
