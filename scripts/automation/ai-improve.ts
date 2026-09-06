import * as fs from 'node:fs';
import * as path from 'node:path';
import { GoogleGenAI } from '@google/genai';

function getFilesRecursively(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFilesRecursively(filePath, fileList);
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

async function improve(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set. Exiting gracefully.');
    process.exit(0);
  }

  try {
    const srcFiles = getFilesRecursively('src');
    const apiFiles = fs.existsSync('api') ? getFilesRecursively('api') : [];
    const scriptFiles = fs.existsSync('scripts') ? getFilesRecursively('scripts') : [];

    const allFiles = [...srcFiles, ...apiFiles, ...scriptFiles];

    // Simple sampling logic
    const sampledFiles = allFiles.sort(() => 0.5 - Math.random()).slice(0, 10);

    let codebaseContext = '';
    for (const file of sampledFiles) {
        codebaseContext += `\n--- ${file} ---\n`;
        codebaseContext += fs.readFileSync(file, 'utf8');
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert AI architect and open source maintainer. Analyze this sample of the codebase and provide a continuous improvement report.
Identify weaknesses, technical debt, documentation gaps, security risks, performance issues, and architectural concerns. Provide actionable recommendations.

Codebase Sample:
${codebaseContext}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    if (response.text) {
        fs.mkdirSync('docs/history', { recursive: true });
        const reportPath = 'docs/history/ai-improvement-report.md';
        const content = `# AI Continuous Improvement Report\nDate: ${new Date().toISOString()}\n\n${response.text}`;
        fs.writeFileSync(reportPath, content);
        console.info(`Successfully generated improvement report at ${reportPath}.`);
    } else {
        console.warn('No response text generated from Gemini.');
    }

  } catch (error) {
    console.error('Error during improvement analysis:', error);
    process.exit(1);
  }
}

void improve();
