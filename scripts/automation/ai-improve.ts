import * as fs from 'node:fs';
import * as path from 'node:path';
import { GoogleGenAI } from '@google/genai';
import * as crypto from 'node:crypto';

function getRandomFiles(dir: string, filelist: string[] = [], numFiles = 5): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      getRandomFiles(filepath, filelist, numFiles);
    } else if (filepath.endsWith('.ts') || filepath.endsWith('.tsx')) {
      filelist.push(filepath);
    }
  }
  // Shuffle array and pick `numFiles` random items
  for (let i = filelist.length - 1; i > 0; i--) {
    const j = crypto.randomBytes(1)[0] % (i + 1);
    [filelist[i], filelist[j]] = [filelist[j], filelist[i]];
  }
  return filelist.slice(0, numFiles);
}

async function improve() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Exiting ai-improve.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });

  const files = getRandomFiles('src', [], 5);
  let codeContext = '';
  for (const file of files) {
    codeContext += `\n\n--- ${file} ---\n`;
    codeContext += fs.readFileSync(file, 'utf-8');
  }

  const prompt = `
  You are an AI architect for the Intelli-Credit project.
  Analyze the following sampled source code files and provide architectural insights, detect technical debt, suggest improvements, and identify potential bugs.
  Format your output as a Markdown report suitable for a GitHub Issue.

  Code context:
  ${codeContext}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    fs.mkdirSync('docs/history', { recursive: true });
    fs.writeFileSync('docs/history/ai-improvement-report.md', response.text || '');
    console.info('AI improvement report generated successfully.');
  } catch (error) {
    console.error('Error calling Gemini API for ai-improve', error);
    process.exit(1);
  }
}

void improve();
