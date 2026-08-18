import fs from 'node:fs';
import path from 'node:path';
import { GoogleGenAI } from '@google/genai';

function getAllTSFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('dist')) {
        arrayOfFiles = getAllTSFiles(fullPath, arrayOfFiles);
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

async function improve(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('GEMINI_API_KEY missing, exiting gracefully.');
    process.exit(0);
  }

  let codeSamples = '';
  const srcFiles = getAllTSFiles('src');
  const apiFiles = fs.existsSync('api') ? getAllTSFiles('api') : [];
  const scriptFiles = fs.existsSync('scripts') ? getAllTSFiles('scripts') : [];

  const keyFiles = [...srcFiles, ...apiFiles, ...scriptFiles].slice(0, 15); // limit to avoid token exhaustion

  keyFiles.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf-8');
        codeSamples += `\n--- File: ${file} ---\n${content.substring(0, 1000)}\n`;
    } catch {
        console.warn(`Could not read ${file}`);
    }
  });

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Analyze this subset of our repository codebase and identify areas for improvement. Look for:
- Technical debt
- Missing documentation
- Security risks
- Performance bottlenecks
- Architectural concerns

Provide a structured report in Markdown with actionable recommendations. Focus on the most critical improvements.

Codebase samples:
${codeSamples}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    if (response.text) {
      fs.writeFileSync('ai-improvement-report.md', response.text);
      console.info('Improvement report written to ai-improvement-report.md');
    }
  } catch (error) {
    console.error('Error during AI improvement analysis:', error);
    process.exit(1);
  }
}

void improve();
