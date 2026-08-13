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

async function analyze(): Promise<void> {
  const outDir = 'docs/architecture';
  fs.mkdirSync(outDir, { recursive: true });

  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not set. Skipping repo analysis.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const directories = ['src', 'api'];
  let codebaseContext = '';

  for (const dir of directories) {
    const files = getFiles(dir);
    for (const file of files) {
      try {
         const content = fs.readFileSync(file, 'utf8');
         codebaseContext += `\n--- File: ${file} ---\n${content.substring(0, 500)}\n`;
      } catch (e) {
          console.warn(`Could not read file ${file}`, e);
      }
    }
  }

  try {
    const prompt = `
      You are an AI architect analyzing the Intelli-Credit Terminal repository.
      Based on the following file snippets, please generate a high-level architecture markdown document.
      Discuss the frontend React application, the backend API functions, and their interactions.

      Codebase Context:
      ${codebaseContext}

      Format the output as a clean, well-structured Markdown document.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text || '# Architecture\nNo architecture could be determined.';

    fs.writeFileSync(path.join(outDir, 'architecture.md'), report);
    console.info('Architecture report written to docs/architecture/architecture.md');
  } catch (error) {
    console.error('Error during repo analysis:', error);
    process.exit(1);
  }
}

void analyze();
