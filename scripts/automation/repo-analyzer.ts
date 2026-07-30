import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import { execFileSync } from 'child_process';

async function analyze() {
  if (!process.env.GEMINI_API_KEY) {
    console.info('GEMINI_API_KEY not found. Skipping repo analysis.');
    process.exit(0);
  }

  fs.mkdirSync('docs/architecture', { recursive: true });

  let tree = '';
  try {
    tree = (
      execFileSync('find', [
        '.',
        '-type',
        'f',
        '-not',
        '-path',
        '*/node_modules/*',
        '-not',
        '-path',
        '*/.git/*',
      ]) as unknown as Buffer
    ).toString('utf-8');
  } catch {
    console.warn('Failed to retrieve file tree.');
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `You are a Repository Analyst AI.
Analyze the following file tree of the Intelli-Credit project and produce a "Repository Architecture & Structure Analysis" document in Markdown format.
Describe the project structure, main modules, and their responsibilities based on file naming conventions.

File tree:
${tree}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    fs.writeFileSync('docs/architecture/repo-analysis.md', response.text, 'utf-8');
    console.info('Successfully generated repository analysis.');
  } catch (error) {
    console.error('Error calling Gemini API for repo analysis:', error);
    process.exit(1);
  }
}

void analyze();
