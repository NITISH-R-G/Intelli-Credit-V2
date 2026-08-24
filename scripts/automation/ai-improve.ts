import * as fs from 'node:fs';
import * as path from 'node:path';
import { GoogleGenAI } from '@google/genai';

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;

  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

async function improve(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Exiting gracefully.');
    process.exit(0);
  }

  const dirsToScan = ['src', 'api', 'scripts'];
  let allFiles: string[] = [];
  dirsToScan.forEach((dir) => {
    allFiles = allFiles.concat(getAllFiles(dir));
  });

  if (allFiles.length === 0) {
    console.warn('No TypeScript files found to analyze.');
    process.exit(0);
  }

  // To avoid hitting token limits, we'll just read a sample of key files
  // In a real advanced setup, this would use embeddings or batched processing.
  const sampleFiles = allFiles.slice(0, 15);
  let repoContext = '';

  sampleFiles.forEach((file) => {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      repoContext += `\n--- ${file} ---\n${content.substring(0, 500)}...\n`;
    } catch (error) {
      console.warn(`Could not read file ${file}:`, error);
    }
  });

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are an expert AI software architect running a continuous improvement loop.
Analyze the following samples from the repository's codebase and identify:
1. Technical debt
2. Potential bugs
3. Architectural improvements
4. Security risks

Code Samples:
${repoContext}

Generate a comprehensive Markdown report detailing your findings and actionable recommendations for improvement.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const reportContent =
      response.text || 'No significant improvements identified during this cycle.';

    const outDir = 'docs/history';
    fs.mkdirSync(outDir, { recursive: true });

    fs.writeFileSync(path.join(outDir, 'ai-improvement-report.md'), reportContent);
    console.info('AI improvement report generated successfully.');
  } catch (error) {
    console.error('Error during AI improvement analysis:', error);
    process.exit(1);
  }
}

void improve();
