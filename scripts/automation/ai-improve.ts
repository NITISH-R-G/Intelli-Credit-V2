import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

function getFilesRecursively(directory: string): string[] {
  let files: string[] = [];
  if (!fs.existsSync(directory)) return files;

  const items = fs.readdirSync(directory, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(directory, item.name);
    if (item.isDirectory()) {
      files = files.concat(getFilesRecursively(fullPath));
    } else if (item.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  }

  return files;
}

async function improveRepo() {
  if (!process.env.GEMINI_API_KEY) {
    console.info('GEMINI_API_KEY not found. Skipping AI Improvement Loop.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const directories = ['src', 'api', 'scripts'];
  let allCode = '';

  for (const dir of directories) {
    const files = getFilesRecursively(dir);
    for (const file of files) {
      allCode += `\n\n--- ${file} ---\n`;
      allCode += fs.readFileSync(file, 'utf8');
    }
  }

  const prompt = `You are an AI architect analyzing a repository. Review the following code and suggest architecture improvements, identify technical debt, or recommend optimizations.

Code:
${allCode.substring(0, 500000)} // Limiting to avoid token overflow, assuming moderate size for now.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text;
    fs.writeFileSync('ai-improvement-report.md', report || 'No recommendations generated.');
    console.info('AI Improvement Report generated successfully.');
  } catch (error) {
    console.error('Error generating AI Improvement Report:', error);
    process.exit(1);
  }
}

void improveRepo();
