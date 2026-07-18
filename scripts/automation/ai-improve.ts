import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.info('GEMINI_API_KEY not found. Skipping continuous improvement loop.');
    process.exit(0);
  }

  let codeContext = '';
  try {
    if (fs.existsSync('package.json')) {
      codeContext += `\n\n--- package.json ---\n${fs.readFileSync('package.json', 'utf-8')}`;
    }
    if (fs.existsSync('server.ts')) {
      codeContext += `\n\n--- server.ts ---\n${fs.readFileSync('server.ts', 'utf-8')}`;
    }
  } catch (error) {
    console.warn('Could not read context files:', error);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Analyze the provided codebase files and generate a code quality report and refactoring suggestions. Identify weaknesses, technical debt, security risks, and performance issues.

Files:
${codeContext}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const report = response.text;

    fs.mkdirSync('docs/architecture', { recursive: true });
    fs.writeFileSync('docs/architecture/improvement-report.md', report || 'No report generated.');
    console.info('Successfully generated improvement report.');
  } catch (error) {
    console.error('Error generating improvement report:', error);
    process.exit(1);
  }
}

main();
