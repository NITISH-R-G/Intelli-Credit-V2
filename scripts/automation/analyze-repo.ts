import * as fs from 'node:fs';

import { GoogleGenAI } from '@google/genai';
import * as path from 'node:path';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('GEMINI_API_KEY not found. Exiting gracefully.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
        arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
      }
    } else {
      if (
        file.endsWith('.ts') ||
        file.endsWith('.tsx') ||
        file.endsWith('.js') ||
        file.endsWith('.jsx')
      ) {
        arrayOfFiles.push(path.join(dirPath, '/', file));
      }
    }
  });

  return arrayOfFiles;
}

async function analyze() {
  try {
    const files = getAllFiles('.');
    // sample some files for context
    const sampledFiles = files.sort(() => 0.5 - Math.random()).slice(0, 15);

    let promptContext =
      'Analyze the following repository files and generate a high-level architecture overview, suggesting architectural improvements.\n\n';

    for (const file of sampledFiles) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        promptContext += `\n\n--- File: ${file} ---\n${content}\n`;
      } catch (e) {
        console.error(`Error reading ${file}:`, e);
      }
    }

    const prompt = `${promptContext}\n\nPlease generate a comprehensive architecture document outlining the components, data flow, and any potential bottlenecks or security risks based on the sampled files. Format as Markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    fs.mkdirSync('docs/architecture', { recursive: true });
    fs.writeFileSync('docs/architecture/ai-architecture-report.md', response.text);
    console.info('Successfully generated AI architecture report.');
  } catch (error) {
    console.error('Error running AI architecture analysis:', error);
    process.exit(1);
  }
}

analyze().catch(console.error);
