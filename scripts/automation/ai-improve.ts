import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import * as path from 'node:path';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.info('Skipping AI improve: GEMINI_API_KEY is not set.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

function getFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        getFiles(filePath, fileList);
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        fileList.push(filePath);
      }
    }
  }

  return fileList;
}

async function improve() {
  const dirsToScan = ['src', 'api', 'scripts'];
  const allFiles: string[] = [];

  for (const dir of dirsToScan) {
    if (fs.existsSync(dir)) {
      allFiles.push(...getFiles(dir));
    }
  }

  let codeContext = '';
  // Limit to first 20 files to avoid exceeding token limits during tests
  for (const file of allFiles.slice(0, 20)) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      codeContext += `\n--- ${file} ---\n${content}\n`;
    } catch (e) {
      console.warn(`Could not read ${file}`);
    }
  }

  const prompt = `
You are an expert software engineer analyzing a repository. Review the following code files and provide recommendations for improvements, refactoring, technical debt reduction, and missing documentation.

${codeContext}

Provide a detailed markdown report with your findings. Format your response with a title and clear sections.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text || '# AI Improvement Report\n\nNo recommendations at this time.';

    const outputDir = 'docs/history';
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'ai-improvement-report.md'), report, 'utf8');

    console.info('AI improvement report generated successfully.');
  } catch (error) {
    console.error('Error generating AI improvement report:', error);
    process.exit(1);
  }
}

void improve();
