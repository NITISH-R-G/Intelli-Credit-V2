import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import * as path from 'node:path';

function findCodeFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        findCodeFiles(filePath, fileList);
      }
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

async function improve(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('No GEMINI_API_KEY found. Exiting gracefully.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });

  const rootDirs = ['src', 'api', 'scripts'];
  const allFiles: string[] = [];

  for (const dir of rootDirs) {
    if (fs.existsSync(dir)) {
      findCodeFiles(dir, allFiles);
    }
  }

  // Instead of an arbitrary 15-file limit, prioritize core app files and random sample others to fit prompt sizes
  const prioritizedFiles = allFiles.filter(
    (f) =>
      f.includes('api/analyze.ts') ||
      f.includes('api/_lib/analyze-core.ts') ||
      f.includes('src/services/analysisService.ts') ||
      f.includes('src/App.tsx'),
  );

  // Randomly add up to 10 more files to provide broad coverage across cycles
  const otherFiles = allFiles.filter((f) => !prioritizedFiles.includes(f));
  const sampledFiles = [...prioritizedFiles];
  for (let i = 0; i < 10 && otherFiles.length > 0; i++) {
    const idx = Math.floor(Math.random() * otherFiles.length);
    sampledFiles.push(otherFiles.splice(idx, 1)[0]);
  }

  let codeContext = '';
  for (const file of sampledFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      codeContext += `\n--- File: ${file} ---\n${content}\n`;
    } catch (e) {
      console.warn(`Could not read ${file}`);
    }
  }

  const prompt = `
You are an expert AI architect running a continuous improvement loop.
Review the following codebase sample and suggest structural, security, or maintainability improvements.

Codebase context:
${codeContext}

Output your findings as a Markdown report detailing technical debt, security issues, or code quality improvements.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const reply = response.text;
    if (reply) {
      const outDir = 'docs/history';
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      fs.writeFileSync(path.join(outDir, 'ai-improvement-report.md'), reply);
      console.info('Improvement report written to docs/history/ai-improvement-report.md');
    }
  } catch (err) {
    console.error('Error running AI improvement loop:', err);
    process.exit(1);
  }
}

void improve();
