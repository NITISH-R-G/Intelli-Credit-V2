import * as fs from 'node:fs';
import * as path from 'node:path';
import { GoogleGenAI } from '@google/genai';

function getFilesRecursively(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!filePath.includes('node_modules') && !filePath.includes('dist')) {
        getFilesRecursively(filePath, fileList);
      }
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

async function analyzeRepo(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('GEMINI_API_KEY is missing. Skipping comprehensive repo analysis.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const srcFiles = getFilesRecursively('src');
    const apiFiles = getFilesRecursively('api');
    const scriptFiles = getFilesRecursively('scripts');

    const allFiles = [...srcFiles, ...apiFiles, ...scriptFiles];
    // Sample a subset of files to avoid exceeding context window limits
    const sampleSize = Math.min(20, allFiles.length);
    const shuffled = allFiles.sort(() => 0.5 - (crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295));
    const sampledFiles = shuffled.slice(0, sampleSize);

    let codeContext = '';
    for (const file of sampledFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      codeContext += `\n--- File: ${file} ---\n${content}\n`;
    }

    const prompt = `You are a principal architect analyzing the Intelli-Credit Terminal repository.
Based on the following sampled files, provide a high-level architectural overview and identify key areas of the system.

Sampled Code:
${codeContext}

Format your response as a Markdown document suitable for a README or Architecture guide.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text;
    if (report) {
      const outputDir = 'docs/architecture';
      fs.mkdirSync(outputDir, { recursive: true });
      fs.writeFileSync(path.join(outputDir, 'architecture-overview.md'), report);
      console.info('Successfully generated architecture overview.');
    } else {
      console.warn('AI generated an empty response.');
    }
  } catch (error) {
    console.error('Error during repository analysis:', error);
    process.exit(1);
  }
}

void analyzeRepo();