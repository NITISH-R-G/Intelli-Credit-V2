import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.info('GEMINI_API_KEY not provided. Skipping AI continuous improvement.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });
const model = 'gemini-2.0-flash';

function readSrcFiles(dir: string): string {
  let content = '';
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = `${dir}/${file}`;
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      content += readSrcFiles(filePath);
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      content += `\n--- ${filePath} ---\n`;
      content += fs.readFileSync(filePath, 'utf-8');
    }
  }
  return content;
}

async function improve(): Promise<void> {
  try {
    let codeContext = '';
    if (fs.existsSync('src')) codeContext += readSrcFiles('src');
    if (fs.existsSync('api')) codeContext += readSrcFiles('api');

    const prompt = `You are an AI continuous improvement system for the Intelli-Credit repository.
Review the following source code files and suggest architectural improvements, self-healing automation ideas, tech-debt reduction, or performance enhancements.
Focus on repository governance, automation, security, and developer experience.

Codebase context:
${codeContext.slice(0, 100000)} // Truncating to avoid massive prompts

Generate a detailed markdown report with your findings and suggestions.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    const reportText = response.text;

    if (reportText) {
      fs.writeFileSync('ai-improvement-report.md', reportText, 'utf-8');
      console.info('Improvement report generated successfully.');
    }
  } catch (error) {
    console.error('Failed to run AI improvement loop:', error);
    process.exit(1);
  }
}

void improve();
