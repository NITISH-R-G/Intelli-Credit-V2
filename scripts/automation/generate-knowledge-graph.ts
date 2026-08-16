import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

function getFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

async function generateKnowledgeGraph(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Skipping knowledge graph generation.');
    process.exit(0);
  }

  const dirsToScan = ['src', 'api', 'scripts'];
  const allFiles: string[] = [];
  dirsToScan.forEach(dir => getFiles(dir, allFiles));

  let structure = '';
  for (const file of allFiles) {
    structure += `- ${file}\n`;
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an autonomous AI architect. Analyze the following directory structure of this repository and generate a Knowledge Graph connecting files, modules, components, and concepts. Output this in a structured Markdown format (e.g., Mermaid.js graph or bulleted relationships).

Files:
${structure}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text || "# Knowledge Graph\nNo graph generated.";

    const docsDir = 'docs/architecture';
    fs.mkdirSync(docsDir, { recursive: true });

    fs.writeFileSync(path.join(docsDir, 'KNOWLEDGE_GRAPH.md'), report);
    console.info('Knowledge graph written to docs/architecture/KNOWLEDGE_GRAPH.md');
  } catch (error) {
    console.error('Failed to generate knowledge graph:', error);
    process.exit(1);
  }
}

void generateKnowledgeGraph();
