import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function main() {
  console.info('Generating architecture diagrams...');

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is missing.');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  let pkgInfo = '';
  try {
    pkgInfo = fs.readFileSync('package.json', 'utf-8');
  } catch (e) {
    console.error('Failed to read package.json', e);
  }

  const prompt = `
    Based on the following package.json dependencies, generate a Mermaid.js diagram illustrating the high-level architecture of this application.
    Return ONLY the markdown block containing the mermaid code. Do not include any surrounding explanation.

    ${pkgInfo}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const output =
      response.text ||
      '# Architecture Diagrams\n\n```mermaid\ngraph TD\nA[App] --> B[Dependencies]\n```';

    fs.mkdirSync('docs', { recursive: true });
    fs.writeFileSync('docs/architecture-diagrams.md', output.trim());
    console.info('Diagrams generation complete.');
  } catch (error) {
    console.error('Failed to generate diagrams:', error);
    process.exit(1);
  }
}

main();
