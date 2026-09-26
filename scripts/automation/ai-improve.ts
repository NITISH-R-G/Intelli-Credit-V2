import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

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

function getRandomSample(files: string[], sampleSize: number): string[] {
  const shuffled = [...files].sort(() => 0.5 - (crypto.randomBytes(1)[0] / 255));
  return shuffled.slice(0, sampleSize);
}

async function improve() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Exiting ai-improve.ts gracefully.');
    process.exit(0);
  }

  // Find files in key directories
  const dirs = ['src', 'api', 'scripts'];
  let allFiles: string[] = [];

  dirs.forEach((dir) => {
    if (fs.existsSync(dir)) {
      allFiles = allFiles.concat(getAllFiles(dir));
    }
  });

  if (allFiles.length === 0) {
    console.info('No .ts/.tsx files found to analyze.');
    process.exit(0);
  }

  // Sample files
  const sampleFiles = getRandomSample(allFiles, Math.min(5, allFiles.length));

  let codebaseContext = '';
  sampleFiles.forEach((file) => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      codebaseContext += `\n\n--- File: ${file} ---\n\n${content}`;
    } catch (err) {
      console.warn(`Could not read file ${file}`, err);
    }
  });

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are an AI architect and maintainer analyzing the repository.
Review the following randomly sampled codebase files. Identify technical debt, architecture improvements, security risks, or documentation gaps.
Produce an actionable markdown report with specific recommendations for continuous improvement.
The report will be automatically converted to a GitHub issue, so format it nicely.

Codebase Sample:
${codebaseContext}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const reportContent = response.text || 'No improvement recommendations generated.';

    const outDir = 'docs/history';
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    fs.writeFileSync(path.join(outDir, 'ai-improvement-report.md'), reportContent);
    console.info('Successfully generated AI improvement report.');
  } catch (err) {
    console.error('Failed to generate AI improvement report.', err);
    process.exit(1);
  }
}

void improve();
