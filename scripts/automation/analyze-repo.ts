import * as fs from 'node:fs';
import * as path from 'node:path';
import { GoogleGenAI } from '@google/genai';

function getFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else {
      if (
        filePath.endsWith('.ts') ||
        filePath.endsWith('.tsx') ||
        filePath.endsWith('.json') ||
        filePath.endsWith('.md')
      ) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

async function analyzeRepo(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Skipping repository analysis.');
    process.exit(0);
  }

  const dirsToScan = ['src', 'api', 'docs'];
  const allFiles: string[] = [];
  for (const dir of dirsToScan) {
    getFiles(dir, allFiles);
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are an AI analyzing the repository structure.
Here is a list of important files in the repository:
${allFiles.join('\n')}

Generate a comprehensive Markdown document describing the repository architecture, how these files interact, and overall structure.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const outputDir = 'docs/architecture';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(outputDir, 'repository-analysis.md'),
      response.text ?? 'No analysis generated.',
    );
    console.info('Repository analysis generated successfully.');
  } catch (error) {
    console.error('Failed to generate repository analysis:', error);
    process.exit(1);
  }
}

void analyzeRepo();
