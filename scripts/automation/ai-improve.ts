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

async function improve(): Promise<void> {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not set. Skipping AI improve loop.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const directories = ['src', 'api', 'scripts'];
  let codebaseContext = '';

  for (const dir of directories) {
    const files = getFiles(dir);
    for (const file of files) {
      try {
         const content = fs.readFileSync(file, 'utf8');
         // We only want a representative sample or else we hit token limits easily on big codebases.
         // For a real scenario we'd do smart chunking. For this demo, let's include the first 500 chars of each file.
         codebaseContext += `\n--- File: ${file} ---\n${content.substring(0, 1000)}\n`;
      } catch (e) {
          console.warn(`Could not read file ${file}`, e);
      }
    }
  }

  try {
    const prompt = `
      You are an AI continuous improvement agent for the Intelli-Credit Terminal project.
      Analyze the following codebase snippets and generate an improvement report.
      Identify potential technical debt, performance issues, or architectural improvements.

      Codebase Snippets:
      ${codebaseContext}

      Format the output as a Markdown report.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text || '# AI Improvement Report\nNo significant improvements found.';

    fs.writeFileSync('ai-improvement-report.md', report);
    console.info('Improvement report written to ai-improvement-report.md');
  } catch (error) {
    console.error('Error during AI improvement loop:', error);
    process.exit(1);
  }
}

void improve();
