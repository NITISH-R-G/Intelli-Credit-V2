import * as fs from 'node:fs';
import * as path from 'node:path';
import { GoogleGenAI } from '@google/genai';

function getFilesRecursively(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        getFilesRecursively(filePath, fileList);
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
    console.warn('GEMINI_API_KEY not found. Skipping AI improve loop.');
    process.exit(0);
  }

  try {
    const crypto = await import('node:crypto');
    const allTsFiles = getFilesRecursively(process.cwd());
    const sampledFiles = allTsFiles.sort(() => 0.5 - crypto.randomBytes(1)[0] / 255).slice(0, 10); // Sample 10 random files

    let codeContext = '';
    for (const file of sampledFiles) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        codeContext += `\n\n--- ${file} ---\n\`\`\`typescript\n${content}\n\`\`\``;
      } catch {
        // Ignore read errors
      }
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a senior staff software engineer tasked with continuously improving a repository.
Analyze the following sample of codebase files and provide 1-3 actionable recommendations to improve code quality, architecture, security, or maintainability.
Format your output as a Markdown report suitable for a GitHub Issue body.

Code Sample:
${codeContext}

Response format: Markdown`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text;
    if (report) {
      const outDir = path.join(process.cwd(), 'docs', 'history');
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, 'ai-improvement-report.md'), report, 'utf-8');
      console.info('AI improvement report generated successfully.');
    } else {
      console.warn('AI generated an empty response.');
    }
  } catch {
    console.error('Error during AI improvement loop');
    process.exit(1);
  }
}

improve().catch(() => process.exit(1));
