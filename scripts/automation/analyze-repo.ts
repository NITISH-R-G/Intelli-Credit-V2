import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

function getFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else if (
      filePath.endsWith('.ts') ||
      filePath.endsWith('.tsx') ||
      filePath.endsWith('.json') ||
      filePath.endsWith('.md')
    ) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

async function analyzeRepo(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('GEMINI_API_KEY is not set. Skipping AI repo analysis.');
    process.exit(0);
  }

  const allFiles = getFiles('.');
  const fileListContext = allFiles.join('\\n');

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `You are an expert AI software architect analyzing the Intelli-Credit Terminal repository structure.
Based on the following list of files in the repository, provide a high-level overview of the project structure, main components, and inferred architectural patterns. Output your analysis in Markdown format.

Files:
${fileListContext}`,
    });

    const report = response.text;
    const dir = 'docs/architecture';
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'analyze-report.md'), report || 'Analysis failed.');
    console.info('AI Repo Analysis completed successfully.');
  } catch (error) {
    console.error('Error during AI Repo Analysis:', error);
  }
}

void analyzeRepo();
