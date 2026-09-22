import * as fs from 'node:fs';
import * as path from 'node:path';
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

async function reviewPR(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is missing. Skipping AI PR review.');
    return;
  }

  const diffPath = 'pr-diff.txt';
  if (!fs.existsSync(diffPath)) {
    console.warn('pr-diff.txt not found. Skipping PR review.');
    return;
  }

  let diffContent = '';
  try {
    diffContent = fs.readFileSync(diffPath, 'utf-8');
  } catch {
    console.error('Failed to read pr-diff.txt');
    process.exitCode = 1;
    return;
  }

  if (!diffContent.trim()) {
    console.info('Empty diff. No review needed.');
    return;
  }

  let contextFiles = '';
  const srcFiles = getFiles('src');
  const apiFiles = getFiles('api');
  const allFiles = [...srcFiles, ...apiFiles];
  const sampleSize = Math.min(allFiles.length, 5); // Just a small sample for basic context

  for (let i = 0; i < sampleSize; i++) {
    try {
      const content = fs.readFileSync(allFiles[i], 'utf-8');
      contextFiles += `\n--- ${allFiles[i]} ---\n${content.substring(0, 500)}...\n`;
    } catch {
      // Ignore read errors
    }
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are an expert AI maintainer and senior staff engineer reviewing a Pull Request.
Please review the following git diff.
Focus on:
- Code quality, maintainability, and readability.
- Potential bugs or edge cases.
- Performance and security concerns.
- Adherence to best practices (e.g., using proper React patterns, TypeScript safety).

Here is some sample context of the repo:
${contextFiles}

Here is the PR diff:
${diffContent}

Provide a constructive, detailed review. If it looks perfect, say so. Format your output in Markdown, ready to be posted as a PR comment.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    if (response.text) {
      fs.writeFileSync('pr-comment.txt', response.text, 'utf-8');
      console.info('PR comment generated successfully.');
    } else {
      console.warn('AI generated empty response for PR review.');
    }
  } catch (error) {
    console.error('Error generating AI PR review:', error);
    process.exitCode = 1;
    return;
  }
}

void reviewPR();
