import { GoogleGenAI } from '@google/genai';
import { writeFileSync, readdirSync, statSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

function getDirectoryTree(dir: string, indent = ''): string {
  let tree = '';
  const files = readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git' || file === 'dist' || file === '.github')
      continue;

    const filePath = join(dir, file);
    const stats = statSync(filePath);

    if (stats.isDirectory()) {
      tree += `${indent}- ${file}/\n`;
      tree += getDirectoryTree(filePath, indent + '  ');
    } else {
      tree += `${indent}- ${file}\n`;
    }
  }
  return tree;
}

async function main() {
  const tree = getDirectoryTree('.');
  const apiKey = process.env.GEMINI_API_KEY;

  if (!existsSync('docs')) {
    mkdirSync('docs');
  }

  if (!apiKey) {
    console.warn('No GEMINI_API_KEY found, skipping AI repo analysis.');
    writeFileSync('docs/repo-analysis.md', `# Repository Structure\n\n\`\`\`\n${tree}\n\`\`\`\n`);
    return;
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = `
You are an expert software architect analyzing the Intelli-Credit Terminal repository.
Based on the following directory structure, provide a high-level summary of the architecture, key modules, and how they likely interact.
Format your response in Markdown.

Directory Structure:
\`\`\`
${tree}
\`\`\`
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const analysis = response.text || 'No analysis generated.';
    const finalContent = `# Repository Analysis\n\n## Structure\n\`\`\`\n${tree}\n\`\`\`\n\n## Architecture Summary\n${analysis}`;

    writeFileSync('docs/repo-analysis.md', finalContent);
    console.info('Repository analysis generated and saved to docs/repo-analysis.md');
  } catch (error) {
    console.error('Error during repository analysis:', error);
  }
}

main().catch(console.error);
