import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import { getRepositoryContext } from './utils';

async function generateKnowledgeGraph() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('GEMINI_API_KEY is not set. Exiting gracefully.');
    process.exit(0);
  }

  const { fileTree, codeContext, packageJsonStr } = getRepositoryContext();

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert repository analyst. Create a knowledge graph representation of the dependencies, services, and modules in this repository based on the file structure, package.json, and source code context.
Format it in Markdown (e.g., using Mermaid syntax).

package.json:
${packageJsonStr}

Files:
${fileTree}

Source Code Context:
${codeContext}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text;
    fs.mkdirSync('docs/architecture', { recursive: true });
    fs.writeFileSync('docs/architecture/KNOWLEDGE_GRAPH.md', report);
    console.info('Knowledge graph generated successfully.');
  } catch (err) {
    console.error('Failed to generate AI response:', err);
    process.exit(1);
  }
}

void generateKnowledgeGraph();
