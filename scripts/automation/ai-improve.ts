import * as fs from 'node:fs';
import * as path from 'node:path';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set. Exiting gracefully.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

function getFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!filePath.includes('node_modules') && !filePath.includes('dist')) {
        getFiles(filePath, fileList);
      }
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

async function runImprovement(): Promise<void> {
  try {
    const targetDirs = ['src', 'api', 'scripts'];
    let allFiles: string[] = [];

    for (const dir of targetDirs) {
      if (fs.existsSync(dir)) {
        allFiles = allFiles.concat(getFiles(dir));
      }
    }

    // Randomly sample files to avoid context limit
    const maxFiles = 10;
    const sampledFiles = allFiles.sort(() => 0.5 - Math.random()).slice(0, maxFiles);

    let codeContext = '';
    for (const file of sampledFiles) {
      const content = fs.readFileSync(file, 'utf8');
      codeContext += `\n--- ${file} ---\n${content}\n`;
    }

    const prompt = `You are a staff engineer analyzing this repository for continuous improvement.
Analyze the provided code and generate a report on technical debt, architectural concerns, performance issues, and suggest refactoring opportunities or security enhancements.

Code Context:
${codeContext}

Provide the report in Markdown format. Ensure it is actionable and descriptive.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const output = response.text || 'No improvement recommendations generated.';

    fs.mkdirSync('docs/history', { recursive: true });
    fs.writeFileSync('docs/history/ai-improvement-report.md', output);
    console.info('Continuous improvement analysis completed successfully.');
  } catch (e) {
    console.error('Error during improvement analysis:', e);
    process.exit(1);
  }
}

void runImprovement();
