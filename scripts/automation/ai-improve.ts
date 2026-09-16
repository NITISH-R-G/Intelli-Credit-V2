import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import * as path from 'node:path';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY is not set. Skipping AI Improvement Loop.');
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

async function improve() {
  try {
    const srcFiles = getAllFiles('src');
    const apiFiles = fs.existsSync('api') ? getAllFiles('api') : [];

    const allFiles = [...srcFiles, ...apiFiles];
    // Randomly sample up to 10 files to avoid hitting token limits
    const sampledFiles = allFiles.sort(() => 0.5 - Math.random()).slice(0, 10);

    let codebaseContext = '';
    for (const file of sampledFiles) {
      codebaseContext += `\n--- File: ${file} ---\n`;
      codebaseContext += fs.readFileSync(file, 'utf8');
    }

    const prompt = `You are an autonomous AI system designed to continuously improve a repository.
Analyze the following sampled code from the project.
Identify technical debt, security risks, performance bottlenecks, missing documentation, or architectural concerns.
Generate a structured markdown report detailing your findings and actionable recommendations for improvement.

Codebase Sample:
${codebaseContext}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const aiResponseText = response.text;

    if (aiResponseText) {
      const outputDir = path.join('docs', 'history');
      fs.mkdirSync(outputDir, { recursive: true });
      fs.writeFileSync(path.join(outputDir, 'ai-improvement-report.md'), aiResponseText);
      console.info('Successfully generated AI improvement report.');
    } else {
      console.error('AI response was empty.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error during AI improvement loop:', error);
    process.exit(1);
  }
}

void improve();
