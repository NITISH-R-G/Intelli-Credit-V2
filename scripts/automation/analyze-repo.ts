import * as fs from 'node:fs';
import * as path from 'node:path';
import { GoogleGenAI } from '@google/genai';

function getFilesRecursively(directory: string): string[] {
  let files: string[] = [];
  try {
    const items = fs.readdirSync(directory, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(directory, item.name);
      if (item.isDirectory()) {
        files = files.concat(getFilesRecursively(fullPath));
      } else if (item.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
        files.push(fullPath);
      }
    }
  } catch (err) {
    console.warn(`Could not read directory ${directory}: ${err}`);
  }
  return files;
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Skipping repo analysis generation.');
    process.exit(0);
  }

  const dirsToScan = ['src', 'api', 'scripts'];
  let allFiles: string[] = [];
  for (const dir of dirsToScan) {
    if (fs.existsSync(dir)) {
      allFiles = allFiles.concat(getFilesRecursively(dir));
    }
  }

  let codeContent = '';
  for (const file of allFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      codeContent += `\n\n--- ${file} ---\n${content}`;
    } catch (err) {
      console.warn(`Could not read file ${file}: ${err}`);
    }
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Analyze the following codebase and generate a comprehensive architecture document outlining the system design, key components, data flow, and deployment strategy. Format as Markdown.\n\nCode:\n${codeContent.substring(0, 30000)}... (truncated for length)`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const outputDir = path.join('docs', 'architecture');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(outputDir, 'ARCHITECTURE.md'),
      response.text || 'No architecture generated.',
    );
    console.info('Successfully generated architecture document.');
  } catch (error) {
    console.error('Error generating architecture document:', error);
    process.exit(1);
  }
}

void main();
