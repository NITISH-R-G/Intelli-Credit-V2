import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import * as path from 'node:path';

function getFilesRecursively(directory: string): string[] {
  let files: string[] = [];
  try {
    const items = fs.readdirSync(directory, { withFileTypes: true });
    for (const item of items) {
      if (item.name === 'node_modules' || item.name === '.git' || item.name === 'dist') {
        continue;
      }
      const fullPath = path.join(directory, item.name);
      if (item.isDirectory()) {
        files = files.concat(getFilesRecursively(fullPath));
      } else {
        files.push(fullPath);
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${directory}:`, err);
  }
  return files;
}

async function analyzeRepo() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('GEMINI_API_KEY is not set. Exiting gracefully.');
    process.exit(0);
  }

  const allFiles = getFilesRecursively('.');
  const fileTree = allFiles.join('\n');

  let packageJsonStr = '';
  try {
    packageJsonStr = fs.readFileSync('package.json', 'utf8');
  } catch (err) {
    console.warn('Could not read package.json:', err);
  }

  let codeContext = '';
  for (const file of allFiles) {
    if (file.startsWith('src/') || file.startsWith('api/') || file.startsWith('scripts/')) {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          codeContext += `\n--- ${file} ---\n${content}\n`;
        } catch (err) {
          // ignore
        }
      }
    }
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert Software Architect. Analyze the following repository structure, package.json, and source code to generate a high-level architecture overview.

package.json:
${packageJsonStr}

Files:
${fileTree}

Source Code Context:
${codeContext}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text;
    fs.mkdirSync('docs/architecture', { recursive: true });
    fs.writeFileSync('docs/architecture/ARCHITECTURE_SUMMARY.md', report);
    console.info('Architecture summary generated successfully.');
  } catch (err) {
    console.error('Failed to generate AI response:', err);
    process.exit(1);
  }
}

void analyzeRepo();
