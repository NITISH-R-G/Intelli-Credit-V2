import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Skipping Repo Analysis.');
    process.exit(0);
  }

  try {
    let graphData = '';
    if (fs.existsSync('docs/architecture/knowledge-graph.json')) {
      graphData = fs.readFileSync('docs/architecture/knowledge-graph.json', 'utf-8');
    } else {
      console.info('Knowledge graph not generated yet.');
    }

    const prompt = `You are a Principal Architect. Based on the generated dependency knowledge graph, provide a summary of the repository architecture.

    Knowledge Graph:
    ${graphData}
    `;

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const aiText = response.text;
    if (aiText) {
      fs.mkdirSync('docs/architecture', { recursive: true });
      fs.writeFileSync('docs/architecture/ARCHITECTURE_SUMMARY.md', aiText);
      console.info('Architecture summary written to docs/architecture/ARCHITECTURE_SUMMARY.md');
    }
  } catch (err) {
    console.error('Error during repo analysis:', err);
    process.exit(1);
  }
}

void main();
