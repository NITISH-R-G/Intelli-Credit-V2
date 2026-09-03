import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';
import { execFileSync } from 'node:child_process';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set. Exiting gracefully.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

async function runAnalysis(): Promise<void> {
  try {
    fs.mkdirSync('docs/architecture', { recursive: true });

    // Ensure diagrams and graph are generated
    console.info('Generating diagrams and knowledge graph using madge...');
    execFileSync('npx', [
      '--yes',
      'madge',
      '--image',
      'docs/architecture/dependency-graph.svg',
      './src',
    ]);
    const graphJsonBuffer = execFileSync('npx', [
      '--yes',
      'madge',
      '--json',
      './src',
    ]) as unknown as Buffer;
    const graphJson = graphJsonBuffer.toString();
    fs.writeFileSync('docs/architecture/knowledge-graph.json', graphJson);

    const prompt = `Analyze this dependency knowledge graph and summarize the overall architecture.
Highlight complex dependencies and suggest decoupling opportunities.
Knowledge Graph JSON:
${graphJson}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const output = response.text || 'No architectural analysis generated.';
    fs.writeFileSync('docs/architecture/architecture-analysis.md', output);
    console.info('Repository architecture analysis completed successfully.');
  } catch (e) {
    console.error('Error during repository analysis:', e);
    process.exit(1);
  }
}

void runAnalysis();
