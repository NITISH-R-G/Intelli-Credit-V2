import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';
import * as path from 'node:path';

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach(function (file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

async function analyzeRepo() {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is missing. Skipping Repo Analysis.');
    process.exit(0);
  }

  try {
    const srcFiles = fs.existsSync('src') ? getAllFiles('src') : [];
    const apiFiles = fs.existsSync('api') ? getAllFiles('api') : [];

    const allFiles = [...srcFiles, ...apiFiles];
    // Sample to avoid hitting token limits
    const sampledFiles = allFiles.sort(() => 0.5 - Math.random()).slice(0, 5);

    let codebaseContext = '';
    for (const file of sampledFiles) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        codebaseContext += `\n--- File: ${file} ---\n${content}\n`;
      } catch (err) {
        console.warn(`Could not read ${file}`, err);
      }
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `You are an AI architect analyzing the Intelli-Credit-V2 repository.
Review the following sampled files and generate a brief architecture intelligence report.
Focus on system architecture, data flow, potential bottlenecks, and security posture.

Codebase Sample:
${codebaseContext}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text || 'No architecture insights generated.';

    fs.mkdirSync('docs/architecture', { recursive: true });
    fs.writeFileSync('docs/architecture/ARCHITECTURE_INTELLIGENCE.md', report, 'utf-8');
    console.info(
      'Architecture intelligence report written to docs/architecture/ARCHITECTURE_INTELLIGENCE.md',
    );
  } catch (err) {
    console.error('Error during repository analysis:', err);
    process.exit(1);
  }
}

void analyzeRepo();
