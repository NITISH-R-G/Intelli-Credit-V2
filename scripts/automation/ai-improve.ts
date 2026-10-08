import * as fs from 'node:fs';
import * as path from 'node:path';
import { GoogleGenAI } from '@google/genai';

function getFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'coverage', '.github'].includes(file)) {
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
    return;
  }

  const ai = new GoogleGenAI({ apiKey });

  const allFiles = getFiles('src').concat(getFiles('api')).concat(getFiles('scripts'));

  // Randomly sample files to avoid context limit
  const sampledFiles = allFiles.sort(() => 0.5 - (((await import('node:crypto')).randomBytes(1)[0]) / 255)).slice(0, 5);

  let context = '';
  for (const file of sampledFiles) {
      try {
          const content = fs.readFileSync(file, 'utf-8');
          context += `\n\n--- ${file} ---\n${content}`;
      } catch {
          // Ignore read errors
      }
  }

  const prompt = `
You are the lead AI architect for Intelli-Credit Terminal, an advanced corporate credit appraisal system.
Your job is to continuously analyze the codebase and suggest improvements.

Here is a sample of the codebase:
${context}

Please provide 1-3 actionable recommendations for improving the code, architecture, security, or documentation based on the sample above. Format your response as a Markdown report.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    fs.mkdirSync('docs/history', { recursive: true });
    fs.writeFileSync('docs/history/ai-improvement-report.md', response.text || '');
  } catch {
    // Ignore error
  }
}

await improve().catch(() => {
    process.exit(1);
});
