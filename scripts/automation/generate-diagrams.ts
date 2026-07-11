import { GoogleGenAI } from '@google/genai';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

async function main() {
  if (!existsSync('docs/repo-analysis.md')) {
    console.error('docs/repo-analysis.md not found. Run analyze-repo first.');
    process.exit(1);
  }

  const analysis = readFileSync('docs/repo-analysis.md', 'utf-8');
  const apiKey = process.env.GEMINI_API_KEY;

  if (!existsSync('docs/architecture')) {
    mkdirSync('docs/architecture', { recursive: true });
  }

  if (!apiKey) {
    console.warn('No GEMINI_API_KEY found, skipping AI diagram generation.');
    return;
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = `
Based on the following repository analysis, generate a Mermaid.js diagram representing the high-level system architecture of the Intelli-Credit Terminal.
The response should CONTAIN ONLY the raw Mermaid diagram code (no markdown formatting blocks like \`\`\`mermaid, no explanations, just the mermaid graph syntax starting with graph TD or similar).

Repository Analysis:
${analysis}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let diagram = response.text || '';

    // Clean up if the model accidentally included markdown blocks
    diagram = diagram
      .replace(/```mermaid/gi, '')
      .replace(/```/g, '')
      .trim();

    writeFileSync('docs/architecture/system-architecture.mermaid', diagram);
    console.info('Diagram generated and saved to docs/architecture/system-architecture.mermaid');
  } catch (error) {
    console.error('Error during diagram generation:', error);
  }
}

main().catch(console.error);
