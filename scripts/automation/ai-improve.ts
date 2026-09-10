import * as fs from 'node:fs';
import * as path from 'node:path';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY is missing. Skipping continuous improvement.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;

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

async function improve() {
  fs.mkdirSync('docs/history', { recursive: true });

  const directoriesToSample = ['src', 'api', 'scripts'];
  let allFiles: string[] = [];

  directoriesToSample.forEach((dir) => {
    allFiles = getAllFiles(dir, allFiles);
  });

  // Sample up to 10 files to avoid exceeding context window
  const sampledFiles = allFiles.sort(() => 0.5 - Math.random()).slice(0, 10);

  let codeContext = '';
  sampledFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');
    codeContext += `\n--- File: ${file} ---\n\`\`\`typescript\n${content}\n\`\`\`\n`;
  });

  const prompt = `
You are an expert AI software architect and open-source maintainer.
I am providing you with a random sample of the codebase for our corporate credit appraisal system (Intelli-Credit Terminal).

Review the code and provide recommendations for improvement. Focus on:
1. Technical debt.
2. Architecture improvements.
3. Security considerations.
4. Code quality and performance.

Code Sample:
${codeContext}

Output your recommendations as a markdown report suitable for creating a GitHub Issue. Provide actionable steps.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const responseText = response.text;
    if (responseText) {
      fs.writeFileSync('docs/history/ai-improvement-report.md', responseText, 'utf8');
      console.info('Improvement report written to docs/history/ai-improvement-report.md');
    }
  } catch (error) {
    console.error('Error during AI improvement analysis:', error);
    process.exit(0);
  }
}

void improve();
