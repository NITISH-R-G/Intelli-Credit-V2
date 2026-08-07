import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import { getAllCodeFilesContent } from './utils.js';

async function generateKnowledgeGraph() {
  if (!process.env.GEMINI_API_KEY) {
    console.info('GEMINI_API_KEY not found. Skipping Knowledge Graph Generation.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const allCode = getAllCodeFilesContent();

  const prompt = `You are a software architect. Analyze the provided source code and generate a knowledge graph representing the repository structure, components, their dependencies, and how they interact. Format the output in Mermaid.js syntax or plain text lists mapping connections.

Code:
${allCode.substring(0, 500000)}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text;
    fs.mkdirSync('docs/architecture', { recursive: true });
    fs.writeFileSync('docs/architecture/knowledge-graph.md', report || 'No knowledge graph generated.');
    console.info('Knowledge graph generated successfully.');
  } catch (error) {
    console.error('Error generating knowledge graph:', error);
    process.exit(1);
  }
}

void generateKnowledgeGraph();
