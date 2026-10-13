import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

function getFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!['node_modules', '.git', '.github', 'dist', 'coverage', 'docs'].includes(file)) {
        getFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

async function improve(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    process.stderr.write('Missing GEMINI_API_KEY.\n');
    process.exit(1);
  }

  let codeContext = '';
  const coreDirs = ['src', 'api', 'scripts'];
  for (const dir of coreDirs) {
    if (fs.existsSync(dir)) {
      const files = getFiles(dir);
      // Sample up to 10 files to avoid hitting token limits
      const sampledFiles = files.sort(() => crypto.randomBytes(1)[0] / 255 - 0.5).slice(0, 10);
      for (const file of sampledFiles) {
        try {
          const content = fs.readFileSync(file, 'utf-8');
          codeContext += `\n--- File: ${file} ---\n${content}\n`;
        } catch {
          process.stderr.write(`Failed to read file: ${file}\n`);
        }
      }
    }
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a senior staff engineer AI system architect.
Review the following sample of codebase files.
Identify potential weaknesses, technical debt, documentation gaps, security risks, performance issues, and architectural concerns.
Provide actionable recommendations for continuous improvement.

Code Context:
${codeContext}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text;
    if (text) {
      fs.mkdirSync('docs/history', { recursive: true });
      fs.writeFileSync('docs/history/ai-improvement-report.md', text, 'utf-8');
      process.stdout.write('Improvement report generated successfully.\n');
    } else {
      process.stderr.write('No text received from Gemini API.\n');
      process.exit(1);
    }
  } catch {
    process.stderr.write('Error generating improvement report.\n');
    process.exit(1);
  }
}

await improve().catch(() => process.exit(1));
