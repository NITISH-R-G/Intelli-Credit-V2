import { GoogleGenAI } from '@google/genai';
import { execFileSync } from 'child_process';
import * as fs from 'fs';

async function generateDiagrams() {
  console.info('Generating Architecture Diagrams...');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info(
      'GEMINI_API_KEY environment variable is missing. Skipping Diagram Generation (likely running from a fork without secrets).',
    );
    process.exit(0);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });

    let fileList = '';
    try {
      const files = execFileSync('git', ['ls-files'], { encoding: 'utf-8' });
      fileList = files;
    } catch (error) {
      console.warn('Could not read git tracked files.', error);
    }

    const prompt = `Based on the following repository files, generate a Mermaid.js diagram representing the high-level architecture and data flow. Output only the Mermaid code block.\n\nFiles:\n${fileList}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    console.info('Diagram Generation Complete.');

    const output = `# Architecture Diagram\n\n\`\`\`mermaid\n${response.text.replace(/```mermaid/g, '').replace(/```/g, '')}\n\`\`\``;
    fs.mkdirSync('docs/architecture', { recursive: true });
    fs.writeFileSync('docs/architecture/architecture-diagram.md', output);
    console.info('Saved diagram to docs/architecture/architecture-diagram.md');
  } catch (error) {
    console.error('Error generating diagrams:', error);
    process.exit(1);
  }
}

generateDiagrams();
