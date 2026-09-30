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
      getFiles(filePath, fileList);
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

async function improve(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Skipping AI improvement loop.');
    process.exit(0);
  }

  try {
    const srcFiles = getFiles('src');
    const apiFiles = getFiles('api');
    const scriptFiles = getFiles('scripts');
    const allFiles = [...srcFiles, ...apiFiles, ...scriptFiles];

    // Shuffle using crypto
    for (let i = allFiles.length - 1; i > 0; i--) {
      const j = Math.floor((crypto.randomBytes(1)[0] / 256) * (i + 1));
      [allFiles[i], allFiles[j]] = [allFiles[j], allFiles[i]];
    }

    // sample up to 5 random files to avoid context limit
    const sampled = allFiles.slice(0, 5);

    let codeContext = '';
    for (const f of sampled) {
      codeContext += `\n--- ${f} ---\n${fs.readFileSync(f, 'utf8')}\n`;
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a world-class AI repository maintainer. Analyze the following randomly sampled files from our codebase.
Detect weaknesses, technical debt, documentation gaps, security risks, performance issues, and architectural concerns.
Provide actionable recommendations for continuous improvement.
Limit your response to 500 words. Keep it strictly focused on concrete improvements.

Codebase sample:
${codeContext}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const aiReport = response.text || 'Unable to generate improvement report.';

    const outputDir = 'docs/history';
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'ai-improvement-report.md'), aiReport);
    console.info('Improvement report generated successfully.');
  } catch (error) {
    console.error('Failed to generate improvement report:', error);
    process.exit(1);
  }
}

void improve();
