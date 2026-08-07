import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

function getFilesRecursively(directory: string): string[] {
  let files: string[] = [];
  if (!fs.existsSync(directory)) return files;

  const items = fs.readdirSync(directory, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(directory, item.name);
    if (item.isDirectory()) {
      files = files.concat(getFilesRecursively(fullPath));
    } else if (item.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  }

  return files;
}

async function analyzeRepo() {
  if (!process.env.GEMINI_API_KEY) {
    console.info('GEMINI_API_KEY not found. Skipping Repository Analysis.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const directories = ['src', 'api', 'scripts'];
  let allCode = '';

  for (const dir of directories) {
    const files = getFilesRecursively(dir);
    for (const file of files) {
      allCode += `\n\n--- ${file} ---\n`;
      allCode += fs.readFileSync(file, 'utf8');
    }
  }

  const prompt = `You are a software architect. Analyze the provided source code and provide a text-based architecture overview, including main components, technologies used, data flow, and potential areas for improvement. Format the output in Markdown.

Code:
${allCode.substring(0, 500000)}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text;
    fs.mkdirSync('docs/architecture', { recursive: true });
    fs.writeFileSync('docs/architecture/repo-analysis.md', report || 'No analysis generated.');
    console.info('Repository analysis generated successfully.');
  } catch (error) {
    console.error('Error generating repository analysis:', error);
    process.exit(1);
  }
}

void analyzeRepo();
