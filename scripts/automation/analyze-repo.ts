import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import * as path from 'node:path';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY is not set. Skipping Repo Analysis.');
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

async function analyze() {
  try {
    const srcFiles = getAllFiles('src');
    const apiFiles = fs.existsSync('api') ? getAllFiles('api') : [];

    const allFiles = [...srcFiles, ...apiFiles];
    // Randomly sample up to 15 files
    const sampledFiles = allFiles.sort(() => 0.5 - Math.random()).slice(0, 15);

    let codebaseContext = '';
    for (const file of sampledFiles) {
      codebaseContext += `\n--- File: ${file} ---\n`;
      codebaseContext += fs.readFileSync(file, 'utf8');
    }

    let pkgJson = '';
    if (fs.existsSync('package.json')) {
      pkgJson = fs.readFileSync('package.json', 'utf8');
    }

    const prompt = `You are a system architecture AI analyzing a repository.
Based on the following sampled codebase and package.json, generate a comprehensive repository context report.
Include an overview of the architecture, key dependencies, data flow, and project structure.

Package.json:
${pkgJson}

Codebase Sample:
${codebaseContext}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const aiResponseText = response.text;

    if (aiResponseText) {
      const outputDir = path.join('docs', 'architecture');
      fs.mkdirSync(outputDir, { recursive: true });
      fs.writeFileSync(path.join(outputDir, 'repo-context-report.md'), aiResponseText);
      console.info('Successfully generated repo context report.');
    } else {
      console.error('AI response was empty.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error during repo analysis:', error);
    process.exit(1);
  }
}

void analyze();
