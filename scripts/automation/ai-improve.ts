import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import * as path from 'node:path';

function getFiles(dir: string, fileList: string[] = []): string[] {
  const ignoredDirs = ['node_modules', '.git', 'dist', 'coverage', '.github'];

  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        if (!ignoredDirs.includes(file)) {
          getFiles(filePath, fileList);
        }
      } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        fileList.push(filePath);
      }
    }
  } catch (error) {
    process.stderr.write(`Failed reading dir ${dir}: ${error}\n`);
  }
  return fileList;
}

async function improve() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    process.stderr.write('GEMINI_API_KEY is required\n');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });

  const coreDirs = ['src', 'api', 'scripts'];
  const allFiles: string[] = [];

  for (const dir of coreDirs) {
    if (fs.existsSync(dir)) {
      getFiles(dir, allFiles);
    }
  }

  // To prevent context overflow, we'll take a sample
  const maxFilesToRead = 10;
  const filesToRead = allFiles.slice(0, maxFilesToRead);

  let codebaseContext = '';
  for (const file of filesToRead) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      codebaseContext += `\n--- File: ${file} ---\n${content.substring(0, 500)}... (truncated)\n`;
    } catch {
       // Ignore read errors
    }
  }

  const prompt = `
You are an expert AI system responsible for continuously improving the Intelli-Credit repository.
Analyze the following sampled codebase snippets and recommend improvements.
Focus on:
1. Technical debt reduction
2. Architecture enhancements
3. Performance and security
4. Automation opportunities

Codebase Sample:
${codebaseContext}

Generate a structured markdown report of your findings, actionable recommendations, and areas that need immediate attention. Include a title.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    if (response.text) {
      const outputDir = 'docs/history';
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      fs.writeFileSync(`${outputDir}/ai-improvement-report.md`, response.text);
      process.stdout.write('AI improvement report generated successfully.\n');
    } else {
      process.stderr.write('No text returned from Gemini.\n');
    }
  } catch (error) {
    process.stderr.write(`Failed to generate improvement report: ${error}\n`);
    process.exit(1);
  }
}

await improve().catch(() => process.exit(1));
