import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';
import * as path from 'node:path';

function getFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else {
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

async function improve(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is missing. Skipping AI improve loop.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    let allFiles: string[] = [];
    if (fs.existsSync('src')) allFiles = allFiles.concat(getFiles('src'));
    if (fs.existsSync('api')) allFiles = allFiles.concat(getFiles('api'));
    if (fs.existsSync('scripts')) allFiles = allFiles.concat(getFiles('scripts'));

    // Prioritize key architectural files, then sample random ones to fit context
    const sampledFiles = allFiles.sort(() => 0.5 - Math.random()).slice(0, 10);

    let codeContext = '';
    for (const file of sampledFiles) {
      codeContext += `\n--- ${file} ---\n`;
      codeContext += fs.readFileSync(file, 'utf-8');
    }

    const prompt = `
Analyze the following sampled TypeScript/TSX code from the repository:

${codeContext}

Your task is to identify weaknesses, technical debt, documentation gaps, security risks, performance issues, or architectural concerns.
Provide actionable recommendations in Markdown format to continuously improve the project.
Format it as a GitHub Issue body.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const reportContent = response.text || 'No recommendations generated.';

    const outputDir = path.join('docs', 'history');
    fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(path.join(outputDir, 'ai-improvement-report.md'), reportContent);
    console.info('AI improvement report generated successfully.');
  } catch (error) {
    console.error('Error during AI improvement loop:', error);
    process.exit(1);
  }
}

void improve();
