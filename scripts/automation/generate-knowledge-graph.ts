import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import { execFileSync } from 'child_process';

async function generate() {
  if (!process.env.GEMINI_API_KEY) {
    console.info('GEMINI_API_KEY not found. Skipping knowledge graph generation.');
    process.exit(0);
  }

  fs.mkdirSync('docs/architecture', { recursive: true });

  let tree = '';
  try {
    tree = (
      execFileSync('find', [
        'src/',
        '-type',
        'f',
        '-not',
        '-path',
        '*/node_modules/*',
      ]) as unknown as Buffer
    ).toString('utf-8');
  } catch {
    console.warn('Failed to retrieve file tree.');
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `You are a Repository Intelligence AI.
Analyze the following source files of the Intelli-Credit project and produce a "Knowledge Graph" document in Markdown format (mermaid diagrams if applicable).
Describe the relationships between key modules, APIs, components, and data structures.

File tree:
${tree}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    fs.writeFileSync('docs/architecture/knowledge-graph.md', response.text, 'utf-8');
    console.info('Successfully generated knowledge graph.');
  } catch (error) {
    console.error('Error calling Gemini API for knowledge graph:', error);
    process.exit(1);
  }
}

void generate();
