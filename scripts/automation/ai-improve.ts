import * as fs from 'node:fs';
import * as path from 'node:path';

import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('GEMINI_API_KEY not found. Exiting gracefully.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
        arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
      }
    } else {
      if (
        file.endsWith('.ts') ||
        file.endsWith('.tsx') ||
        file.endsWith('.js') ||
        file.endsWith('.jsx')
      ) {
        arrayOfFiles.push(path.join(dirPath, '/', file));
      }
    }
  });

  return arrayOfFiles;
}

async function improve() {
  try {
    const files = getAllFiles('.');
    // sample 10 files
    const sampledFiles = files.sort(() => 0.5 - Math.random()).slice(0, 10);

    let promptContext =
      'Analyze the following repository files for improvements, technical debt, and bugs:\n\n';

    for (const file of sampledFiles) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        promptContext += `\n\n--- File: ${file} ---\n${content}\n`;
      } catch (e) {
        console.error(`Error reading ${file}:`, e);
      }
    }

    const prompt = `${promptContext}\n\nProvide actionable improvements, suggest refactoring, point out potential bugs or security issues, and write a summary. Please format the output in Markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text;

    fs.mkdirSync('docs/history', { recursive: true });
    fs.writeFileSync('docs/history/ai-improvement-report.md', text);
    console.info('Successfully generated AI improvement report.');
  } catch (error) {
    console.error('Error running AI improvement loop:', error);
    process.exit(1);
  }
}

improve().catch(console.error);
