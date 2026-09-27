import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { GoogleGenAI } from '@google/genai';

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

// Helper for random sampling securely
function secureRandom(): number {
  return crypto.randomBytes(1)[0] / 255;
}

async function improve(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is missing. Skipping AI improvement loop.');
    process.exit(0);
  }

  // Sample files for context
  const targetDirs = ['src', 'api', 'scripts'];
  let allTargetFiles: string[] = [];

  for (const dir of targetDirs) {
    if (fs.existsSync(dir)) {
      allTargetFiles = allTargetFiles.concat(getAllFiles(dir));
    }
  }

  // Prioritize some core files if they exist
  const coreFiles = allTargetFiles.filter((f) => f.includes('server.ts') || f.includes('App.tsx'));
  const otherFiles = allTargetFiles.filter(
    (f) => !f.includes('server.ts') && !f.includes('App.tsx'),
  );

  // Randomly sample to avoid context limits
  const sampledOtherFiles = otherFiles.sort(() => secureRandom() - 0.5).slice(0, 5);
  const filesToAnalyze = [...coreFiles, ...sampledOtherFiles];

  let codebaseContext = '';
  for (const file of filesToAnalyze) {
    if (fs.existsSync(file)) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        codebaseContext += `\n--- File: ${file} ---\n${content}\n`;
      } catch {
        console.warn(`Could not read file: ${file}`);
      }
    }
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert AI open-source maintainer acting as an automated continuous improvement system.
Analyze the provided codebase context and identify opportunities for improvement.

Focus on:
1. Technical debt reduction
2. Architecture enhancements
3. Performance optimization
4. Security hardening
5. Contributor experience improvements
6. Documentation gaps

Provide your response as a Markdown report.

Codebase Context:
${codebaseContext}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    if (response.text) {
      fs.mkdirSync('docs/history', { recursive: true });
      fs.writeFileSync('docs/history/ai-improvement-report.md', response.text, 'utf8');
      console.info('Improvement report written to docs/history/ai-improvement-report.md');
    }
  } catch {
    console.error('Failed to generate AI improvement report');
    process.exit(1);
  }
}

void improve();
