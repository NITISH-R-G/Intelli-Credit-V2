import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';
import { execFileSync } from 'node:child_process';

async function main() {
  console.info('Generating knowledge graph...');

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is missing.');
    console.error('Fatal Error');
    process.exitCode = 1;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  let treeInfo = '';
  try {
    // Basic representation of the folder structure
    treeInfo = execFileSync('ls', ['-R', 'src', 'api', 'scripts'], { encoding: 'utf-8' });
  } catch (e) {
    console.error('Failed to read directory structure', e);
  }

  const prompt = `
    Based on the following directory structure of an open-source project, generate a markdown "Knowledge Graph" document.
    Identify the main components, APIs, and scripts, and describe their likely purpose in a bulleted list.

    ${treeInfo.substring(0, 5000)} // Truncating to avoid token limits just in case
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const output = response.text || '# Knowledge Graph\n\nFailed to generate knowledge graph.';

    fs.mkdirSync('docs', { recursive: true });
    fs.writeFileSync('docs/knowledge-graph.md', output.trim());
    console.info('Knowledge graph generation complete.');
  } catch (error) {
    console.error('Failed to generate knowledge graph:', error);
    console.error('Fatal Error');
    process.exitCode = 1;
  }
}

main();
