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

async function analyzeRepo(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Skipping repo analysis.');
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
You are an autonomous AI architect. Analyze the following directory structure of this repository and generate an Architecture Overview Document in Markdown format.
Focus on the separation of concerns, the client-server boundary, and the overall system design.

Files:
${structure}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text || "# Architecture Overview\nNo architecture generated.";

    const docsDir = 'docs/architecture';
    fs.mkdirSync(docsDir, { recursive: true });

    fs.writeFileSync(path.join(docsDir, 'ARCHITECTURE.md'), report);
    console.info('Architecture documentation written to docs/architecture/ARCHITECTURE.md');
  } catch (error) {
    console.error('Failed to generate architecture documentation:', error);
    process.exit(1);
  }
}

analyzeRepo().catch(console.error);
