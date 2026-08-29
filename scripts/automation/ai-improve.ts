import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import * as path from 'node:path';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY is not set. Exiting gracefully.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

async function improve(): Promise<void> {
  const dirsToScan = ['src', 'api', 'scripts'];
  let allCode = '';

  dirsToScan.forEach((dir) => {
    const fullDirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullDirPath)) {
      const files = getAllFiles(fullDirPath);
      files.forEach((file) => {
        const content = fs.readFileSync(file, 'utf8');
        allCode += `\n\n--- File: ${file} ---\n\n${content}`;
      });
    }
  });

  const prompt = `
Please analyze the following TypeScript and React codebase and suggest improvements.
Identify technical debt, security risks, performance issues, and architectural concerns.
Provide actionable recommendations.

Codebase:
${allCode.substring(0, 500000)} // Limiting to avoid token limits, though 2.0-flash is capable, it's a good safeguard
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text || 'No improvements suggested.';
    const outputDir = path.join(process.cwd(), 'docs', 'history');
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'ai-improvement-report.md'), report);
    console.info('Improvement report written to docs/history/ai-improvement-report.md');
  } catch (error) {
    console.error('Error generating content from Gemini:', error);
    process.exit(1);
  }
}

void improve();
