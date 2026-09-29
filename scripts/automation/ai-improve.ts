import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { GoogleGenAI } from '@google/genai';

function getFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        getFiles(filePath, fileList);
      }
    } else {
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

async function runImprovementLoop(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('GEMINI_API_KEY not found. Skipping improvement loop.');
    process.exit(0);
  }

  const allFiles = getFiles('.');
  const coreDirs = ['src', 'api', 'scripts'];
  const coreFiles = allFiles.filter((f) => coreDirs.some((d) => f.startsWith(d)));

  // Randomly sample up to 10 core files to avoid context limits, using crypto for secure random
  const sampledFiles = coreFiles
    .map((value) => ({ value, sort: crypto.randomBytes(1)[0] / 255 }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
    .slice(0, 10);

  let codebaseContext = '';
  for (const file of sampledFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      codebaseContext += `\n--- File: ${file} ---\n${content}\n`;
    } catch {
      console.warn(`Could not read ${file}`);
    }
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert AI software architect and open-source maintainer for Intelli-Credit.
Your task is to analyze the following randomly sampled files from the repository and suggest one actionable, concrete improvement.
This could be a refactoring opportunity, a performance fix, a security enhancement, missing tests, or documentation improvements.

Codebase sample:
${codebaseContext.slice(0, 25000)}

Please output your response in Markdown format, structured as a GitHub Issue:
# Title: [A brief, descriptive title]
## Observation
[What you noticed]
## Recommendation
[What needs to be changed]
## Impact
[Why this matters]
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const resultText = response.text;
    if (resultText) {
      const outDir = path.join('docs', 'history');
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, 'ai-improvement-report.md'), resultText, 'utf8');
      console.info('Successfully wrote AI improvement report.');
    }
  } catch (error) {
    console.error('Failed to generate improvement report via Gemini:', error);
    process.exit(1);
  }
}

void runImprovementLoop();
