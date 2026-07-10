import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { GoogleGenAI } from '@google/genai';
import { execFileSync } from 'node:child_process';

async function generateDiagrams() {
  console.info('Generating architecture diagrams...');
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY environment variable is missing.');
    process.exit(1);
  }

  if (!existsSync('docs/architecture')) {
    mkdirSync('docs/architecture', { recursive: true });
  }

  try {
    const tree = execFileSync('git', ['ls-files'], { encoding: 'utf8' });

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a staff engineer. Look at the file structure of this repository:
${tree.substring(0, 5000)}

Generate a Mermaid.js diagram representing the likely system architecture or file module relationships based on these files.
Output ONLY the mermaid code block, e.g.:
\`\`\`mermaid
graph TD
...
\`\`\`
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    writeFileSync('docs/architecture/system-diagram.md', response.text || 'No diagram generated.');
    console.info(
      'Successfully generated system architecture diagram at docs/architecture/system-diagram.md',
    );
  } catch (error) {
    console.error('Failed to generate diagrams:', error);
    process.exit(1);
  }
}

generateDiagrams();
