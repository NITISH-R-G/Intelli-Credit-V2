import { GoogleGenAI } from '@google/genai';
import fs from 'node:fs';
import path from 'node:path';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('No GEMINI_API_KEY found, exiting gracefully.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

function getTsFiles(dir: string, fileList: string[] = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (
        !filePath.includes('node_modules') &&
        !filePath.includes('.git') &&
        !filePath.includes('dist')
      ) {
        getTsFiles(filePath, fileList);
      }
    } else {
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

async function generate() {
  try {
    const targetDirs = ['src', 'api', 'scripts'];
    let allFiles: string[] = [];
    for (const d of targetDirs) {
      allFiles = allFiles.concat(getTsFiles(d));
    }

    let sourceCode = '';
    let totalTokens = 0;

    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      if (totalTokens + content.length / 4 > 800000) {
        break;
      }
      sourceCode += `\n\n--- ${file} ---\n`;
      sourceCode += content;
      totalTokens += content.length / 4;
    }

    const prompt = `
        You are an AI generating a repository knowledge graph for Intelli-Credit Terminal.
        Review the following source code and architecture context.
        Generate a Markdown file that represents a Knowledge Graph connecting:
        - Files
        - Modules
        - APIs
        - Services

        Keep it concise and formatted as a Markdown list or Mermaid diagram if possible.

        Source Code:
        ${sourceCode}
        `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text || 'Knowledge Graph generation complete.';
    fs.mkdirSync('docs/architecture', { recursive: true });
    fs.writeFileSync('docs/architecture/KNOWLEDGE_GRAPH.md', report, 'utf-8');
    console.info('Successfully generated knowledge graph.');
  } catch (e) {
    console.error('Error during knowledge graph generation:', e);
    process.exit(1);
  }
}

void generate();
