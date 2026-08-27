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
    console.warn('GEMINI_API_KEY is not set. Exiting gracefully.');
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
  const prompt = `Analyze the following codebase and recommend architectural, security, or performance improvements. Output the recommendations in Markdown format, suitable for a GitHub issue.\n\nCode:\n${codeContent.substring(0, 30000)}... (truncated for length)`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const outputDir = path.join('docs', 'history');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(outputDir, 'ai-improvement-report.md'),
      response.text || 'No recommendations generated.',
    );
    console.info('Successfully generated AI improvement report.');
  } catch (error) {
    console.error('Error generating AI improvement report:', error);
    process.exit(1);
  }
}

void main();
