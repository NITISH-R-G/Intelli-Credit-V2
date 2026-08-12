import fs from 'node:fs';
import path from 'node:path';
import { GoogleGenAI } from '@google/genai';

function getFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

async function improve(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Skipping AI improvement.');
    process.exit(0);
  }

  const dirsToScan = ['src', 'api', 'scripts'];
  const allFiles: string[] = [];

  for (const dir of dirsToScan) {
    if (fs.existsSync(dir)) {
      getFiles(dir, allFiles);
    }
  }

  let codeSamples = '';
  // Randomly select a few files to keep the prompt size reasonable
  const filesToScan = allFiles.sort(() => 0.5 - Math.random()).slice(0, 5);

  for (const file of filesToScan) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      codeSamples += `\n--- File: ${file} ---\n${content}\n`;
    } catch (_e) {
      console.warn(`Could not read ${file}`);
    }
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
    You are an AI continuous improvement agent for the Intelli-Credit open-source project.
    Analyze the following code samples from the repository. Identify technical debt,
    potential security risks, performance bottlenecks, or architectural improvements.
    Generate a concise markdown report detailing your findings and actionable recommendations.

    Code Samples:
    ${codeSamples}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text;
    if (report) {
      fs.writeFileSync('ai-improvement-report.md', report);
      console.info('AI improvement report generated successfully.');
    }
  } catch (error) {
    console.error('Error generating AI improvement report:', error);
    process.exit(1);
  }
}

void improve();
