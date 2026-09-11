import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import * as path from 'node:path';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY not found. Skipping AI analysis.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach(function (file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.md')) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

async function analyzeRepo(): Promise<void> {
  try {
    console.info('Starting repo analysis...');
    const files = [
      ...getAllFiles('src'),
      ...getAllFiles('api'),
      ...getAllFiles('scripts'),
      ...getAllFiles('docs'),
    ];
    let context = 'Repository Context:\n';

    // Sample a few files to avoid exceeding token limits
    const sampledFiles = files.sort(() => 0.5 - Math.random()).slice(0, 10);

    for (const file of sampledFiles) {
      context += `\nFile: ${file}\n`;
      try {
        context += fs.readFileSync(file, 'utf-8');
      } catch (e) {
        console.error(`Error reading ${file}`, e);
      }
    }

    console.info('Calling Gemini API for improvements...');
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Analyze the following repository subset and suggest improvements for architecture, security, code quality, or documentation:\n\n${context}`,
    });

    const report = response.text || 'No suggestions.';
    const docsDir = path.join(process.cwd(), 'docs', 'history');
    fs.mkdirSync(docsDir, { recursive: true });

    const reportPath = path.join(docsDir, 'ai-improvement-report.md');
    fs.writeFileSync(reportPath, report);

    console.info(`Report written to ${reportPath}`);
  } catch (err) {
    console.error('Error during repo analysis:', err);
  }
}

void analyzeRepo();
