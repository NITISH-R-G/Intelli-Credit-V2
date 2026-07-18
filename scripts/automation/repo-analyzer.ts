import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';

async function generateDiagrams(ai: GoogleGenAI, packageJson: string) {
  const prompt = `Generate a system architecture diagram in Mermaid markdown format based on these package dependencies:
${packageJson}
Ensure the diagram includes components for React, Express, and any other relevant libraries found. Output ONLY the Mermaid block (starting with \`\`\`mermaid).`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  fs.mkdirSync('docs/architecture', { recursive: true });
  fs.writeFileSync(
    'docs/architecture/architecture-diagram.md',
    response.text || 'No diagram generated.',
  );
  console.info('Successfully generated architecture diagram.');
}

async function generateGraph(ai: GoogleGenAI, packageJson: string) {
  const prompt = `Generate a JSON knowledge graph of the repository's modules and services based on these dependencies. Output ONLY valid JSON:
${packageJson}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  let jsonText = response.text || '{}';
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText
      .replace(/^```json\n?/, '')
      .replace(/\n?```\n?$/, '')
      .trim();
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText
      .replace(/^```\n?/, '')
      .replace(/\n?```\n?$/, '')
      .trim();
  }

  fs.mkdirSync('docs/architecture', { recursive: true });
  fs.writeFileSync('docs/architecture/knowledge-graph.json', jsonText);
  console.info('Successfully generated knowledge graph.');
}

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.info('GEMINI_API_KEY not found. Skipping repo analysis.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const action = process.argv[2];

  let packageJson = '';
  try {
    packageJson = fs.readFileSync('package.json', 'utf-8');
  } catch (err) {
    console.warn('Could not read package.json', err);
  }

  try {
    if (action === 'diagrams') {
      await generateDiagrams(ai, packageJson);
    } else if (action === 'graph') {
      await generateGraph(ai, packageJson);
    } else if (action === 'analyze') {
      await generateDiagrams(ai, packageJson);
      await generateGraph(ai, packageJson);
    } else {
      console.warn('Unknown action. Use "diagrams", "graph", or "analyze".');
    }
  } catch (err) {
    console.error('Error during repo analysis:', err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
