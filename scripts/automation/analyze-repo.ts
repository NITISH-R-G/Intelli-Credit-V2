import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function main() {
  console.info('Analyzing repository architecture...');

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is missing.');
    console.error('Fatal Error');
    process.exitCode = 1;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  let pkgInfo = '';
  try {
    pkgInfo = fs.readFileSync('package.json', 'utf-8');
  } catch (e) {
    console.error('Failed to read package.json', e);
  }

  const prompt = `
    Based on the following package.json dependencies, generate a comprehensive architectural summary of this project.
    Identify the frontend framework, backend framework, and key integrations.
    Format the output in markdown.

    ${pkgInfo}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const output =
      response.text || '# Architecture Analysis\n\nFailed to generate architecture analysis.';

    fs.mkdirSync('docs', { recursive: true });
    fs.writeFileSync('docs/architecture-analysis.md', output.trim());
    console.info('Architecture analysis complete.');
  } catch (error) {
    console.error('Failed to generate architecture analysis:', error);
    console.error('Fatal Error');
    process.exitCode = 1;
  }
}

main();
