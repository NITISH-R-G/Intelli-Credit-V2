import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { GoogleGenAI } from '@google/genai';
import { execFileSync } from 'node:child_process';

async function generateKnowledgeGraph() {
  console.info('Generating repository knowledge graph...');
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY environment variable is missing.');
    process.exit(1);
  }

  if (!existsSync('docs')) {
    mkdirSync('docs', { recursive: true });
  }

  try {
    const tree = execFileSync('git', ['ls-files'], { encoding: 'utf8' });

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are an AI generating a knowledge graph for a repository. Here are the files:
${tree.substring(0, 5000)}

Output a valid JSON object representing a graph. The JSON should have exactly this structure:
{
  "nodes": [{"id": "string", "label": "string"}],
  "edges": [{"from": "node_id", "to": "node_id"}]
}
Include up to 10 nodes representing the most important modules or directories. Do not output anything other than the JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let jsonString = response.text || '{}';
    // Clean up potential markdown formatting
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.substring(7, jsonString.length - 3).trim();
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.substring(3, jsonString.length - 3).trim();
    }

    writeFileSync('docs/knowledge-graph.json', jsonString);
    console.info('Successfully generated knowledge graph at docs/knowledge-graph.json');
  } catch (error) {
    console.error('Failed to generate knowledge graph:', error);
    process.exit(1);
  }
}

generateKnowledgeGraph();
