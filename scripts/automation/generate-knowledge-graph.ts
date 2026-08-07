import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

function getFilesRecursively(directory: string): string[] {
  let files: string[] = [];
  if (!fs.existsSync(directory)) return files;

  const items = fs.readdirSync(directory, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(directory, item.name);
    if (item.isDirectory()) {
      files = files.concat(getFilesRecursively(fullPath));
    } else if (item.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  }

  return files;
}

async function generateKnowledgeGraph() {
  if (!process.env.GEMINI_API_KEY) {
    console.info('GEMINI_API_KEY not found. Skipping Knowledge Graph Generation.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const directories = ['src', 'api', 'scripts'];
  let allCode = '';

  for (const dir of directories) {
    const files = getFilesRecursively(dir);
    for (const file of files) {
      allCode += `\n\n--- ${file} ---\n`;
      allCode += fs.readFileSync(file, 'utf8');
    }
  }

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
    fs.writeFileSync(
      'docs/architecture/knowledge-graph.md',
      report || 'No knowledge graph generated.',
    );
    console.info('Knowledge graph generated successfully.');
  } catch (error) {
    console.error('Error generating knowledge graph:', error);
    process.exit(1);
  }
}

void generateKnowledgeGraph();
