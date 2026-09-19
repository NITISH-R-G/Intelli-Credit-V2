import * as fs from 'node:fs';
import * as path from 'node:path';
import { GoogleGenAI } from '@google/genai';

function getFilesRecursively(dir: string, ext: string): string[] {
  let results: string[] = [];
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        results = results.concat(getFilesRecursively(filePath, ext));
      } else if (file.endsWith(ext)) {
        results.push(filePath);
      }
    }
  } catch {
    console.warn(`Could not read directory ${dir}`);
  }
  return results;
}

async function improveRepo(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('GEMINI_API_KEY not found. Skipping repo improvement.');
    process.exit(0);
  }

  // Sample files for context. Prioritize src/, api/, scripts/
  const tsFiles = [
    ...getFilesRecursively('src', '.ts'),
    ...getFilesRecursively('src', '.tsx'),
    ...getFilesRecursively('api', '.ts'),
    ...getFilesRecursively('scripts', '.ts'),
    'server.ts'
  ].filter(f => fs.existsSync(f));

  // Randomly sample up to 10 files to avoid exceeding token limits
  const crypto = await import('node:crypto');
  const sampledFiles = tsFiles.sort(() => 0.5 - (crypto.randomBytes(1)[0] / 255)).slice(0, 10);

  let codeContext = '';
  for (const file of sampledFiles) {
      try {
          const content = fs.readFileSync(file, 'utf-8');
          codeContext += `\n--- File: ${file} ---\n${content}\n`;
      } catch {
          console.warn(`Could not read file ${file}`);
      }
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are an AI agent designed to continuously improve this repository.
Analyze the following sampled codebase files and identify potential weaknesses, technical debt, documentation gaps, security risks, performance issues, or architectural concerns.

Generate a comprehensive markdown report detailing your findings and actionable recommendations for improvement.

Code Context:
${codeContext}
`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt
    });

    const report = response.text;
    if (report) {
      fs.mkdirSync('docs/history', { recursive: true });
      fs.writeFileSync('docs/history/ai-improvement-report.md', report);
      console.info('Successfully generated AI improvement report to docs/history/ai-improvement-report.md');
    } else {
      console.warn('AI generated an empty report.');
    }
  } catch {
    console.error('Error generating content with Gemini');
    process.exit(1);
  }
}

void improveRepo();
