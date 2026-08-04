import fs from 'node:fs';
import path from 'node:path';
import { GoogleGenAI } from '@google/genai';

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;

  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

async function generateKnowledgeGraph(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('No GEMINI_API_KEY provided. Skipping AI knowledge graph generation.');
    process.exit(0);
  }

  const docsDir = path.join(process.cwd(), 'docs', 'architecture');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Gather file list cross-platform using Node.js fs
    const srcFiles = getAllFiles('src');
    const apiFiles = getAllFiles('api');
    const fileList = [...srcFiles, ...apiFiles].join('\n');

    const prompt = `You are a software architect analyzing an open-source project.
Here is a list of files in the project's source code:
${fileList}

Please generate a high-level markdown representation of a knowledge graph for this repository. Identify key modules, services, and their likely relationships based on the file names and standard architectural patterns for React/Express apps. Focus on discoverability and clear categorization.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const reportContent =
      response.text || '# Repository Knowledge Graph\n\nCould not generate graph.';

    fs.writeFileSync(path.join(docsDir, 'knowledge-graph.md'), reportContent, 'utf-8');
    console.info('Successfully generated knowledge graph.');
  } catch (error) {
    console.error('Error during knowledge graph generation:', error);
    process.exit(1);
  }
}

void generateKnowledgeGraph();
