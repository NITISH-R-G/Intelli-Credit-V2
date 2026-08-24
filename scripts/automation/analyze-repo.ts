import * as fs from 'node:fs';
import * as path from 'node:path';
import { GoogleGenAI } from '@google/genai';

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;

  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      if (
        file.endsWith('.ts') ||
        file.endsWith('.tsx') ||
        file.endsWith('.json') ||
        file.endsWith('.md')
      ) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

async function analyzeRepo(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Exiting gracefully.');
    process.exit(0);
  }

  const dirsToScan = ['src', 'api', 'docs'];
  let allFiles: string[] = [];
  dirsToScan.forEach((dir) => {
    allFiles = allFiles.concat(getAllFiles(dir));
  });

  if (allFiles.length === 0) {
    console.warn('No files found to analyze.');
    process.exit(0);
  }

  const sampleFiles = allFiles.filter((f) => f.endsWith('.ts') || f.endsWith('.tsx')).slice(0, 10);
  let repoContext = '';

  sampleFiles.forEach((file) => {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      repoContext += `\n--- ${file} ---\n${content.substring(0, 300)}...\n`;
    } catch (error) {
      console.warn(`Could not read file ${file}:`, error);
    }
  });

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are an expert AI software architect. Analyze the provided repository samples and generate an architectural summary.
Focus on identifying the core technologies, system design, and potential modularity improvements.

Code Samples:
${repoContext}

Generate a clear, high-level architectural summary in Markdown format.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const reportContent = response.text || 'No significant architectural insights generated.';

    const outDir = 'docs/architecture';
    fs.mkdirSync(outDir, { recursive: true });

    fs.writeFileSync(path.join(outDir, 'architecture-summary.md'), reportContent);
    console.info('Architecture summary generated successfully.');
  } catch (error) {
    console.error('Error during repository analysis:', error);
    process.exit(1);
  }
}

void analyzeRepo();
