import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { GoogleGenAI } from '@google/genai';

function getFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'coverage', '.github'].includes(file)) {
        getFiles(filePath, fileList);
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.md')) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

async function improveRepo() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    process.exit(0);
  }

  const allFiles = getFiles('.');
  const coreFiles = ['README.md', 'package.json', 'src/main.tsx', 'src/App.tsx'];

  const existingCoreFiles = coreFiles.filter((f) => fs.existsSync(f));
  const remainingFiles = allFiles.filter((f) => !coreFiles.includes(f));

  // Randomly sample the remaining files securely
  const shuffled = remainingFiles.sort(() => 0.5 - crypto.randomBytes(1)[0] / 255);
  const sampledFiles = shuffled.slice(0, 15 - existingCoreFiles.length);

  const filesToAnalyze = [...existingCoreFiles, ...sampledFiles];

  let repoContext = '';
  for (const file of filesToAnalyze) {
    const content = fs.readFileSync(file, 'utf8');
    repoContext += `\n--- ${file} ---\n${content}\n`;
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Analyze the following repository context and suggest improvements, technical debt to address, security considerations, and potential documentation gaps. Output a markdown report:

${repoContext}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  });

  const reportDir = 'docs/history';
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(
    path.join(reportDir, 'ai-improvement-report.md'),
    response.text || 'No report generated.',
  );
}

await improveRepo().catch(() => process.exit(1));
