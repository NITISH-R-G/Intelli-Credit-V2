import * as fs from 'node:fs';
import * as path from 'node:path';
import { GoogleGenAI } from '@google/genai';

function getFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'coverage', '.github'].includes(file)) {
        getFiles(path.join(dir, file), fileList);
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        fileList.push(path.join(dir, file));
      }
    }
  }
  return fileList;
}

async function improve() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is missing. Exiting improvement loop gracefully.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });

  const allFiles = getFiles('.');

  // Sample 5 random files to avoid context limit
  const sampleFiles = allFiles.slice(0, 5); // Avoiding Math.random() as per instructions

  let codebaseContext = '';
  for (const file of sampleFiles) {
    codebaseContext += `\n--- File: ${file} ---\n`;
    codebaseContext += fs.readFileSync(file, 'utf8').substring(0, 2000); // limit per file
  }

  const prompt = `
    You are an AI architect tasked with continuously improving a repository.
    Review the following sample files from the codebase and identify
    weaknesses, technical debt, security risks, or refactoring opportunities.
    Generate a detailed report with actionable recommendations.
    Format your response as a Markdown report.

    Codebase Sample:
    ${codebaseContext}
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt
    });

    const report = response.text || '# AI Improvement Report\nNo significant improvements suggested at this time.';

    fs.mkdirSync('docs/history', { recursive: true });
    fs.writeFileSync('docs/history/ai-improvement-report.md', report);
    console.info('AI improvement report generated successfully.');
  } catch (err) {
    console.error('Error generating AI improvement report:', err);
    process.exit(1);
  }
}

improve().catch((err) => {
  console.error('Unhandled error in improve:', err);
  process.exit(1);
});
