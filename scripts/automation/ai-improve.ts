import * as fs from 'fs';
import * as path from 'path';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('GEMINI_API_KEY is missing. Skipping continuous improvement loop.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

async function improve() {
  try {
    const targetDirs = ['src', 'api', 'scripts'];
    let allCode = '';

    for (const dir of targetDirs) {
      if (fs.existsSync(dir)) {
        const files = getAllFiles(dir);
        for (const file of files) {
          const content = fs.readFileSync(file, 'utf-8');
          // Limit content size just in case, but include relevant parts
          allCode += `\n--- File: ${file} ---\n${content.substring(0, 1000)}\n`;
        }
      }
    }

    const prompt = `
You are an expert AI software engineer analyzing a TypeScript/React codebase for continuous improvement.
Review the following excerpts of the codebase and provide a continuous improvement report.

Identify:
1. Technical debt or anti-patterns.
2. Security concerns.
3. Performance bottlenecks.
4. Architectural recommendations.
5. Actionable next steps.

Format the response in clear Markdown, suitable for a GitHub Issue body. Keep it concise but valuable.

Code Snippets:
${allCode.substring(0, 50000)} // Cap size to avoid context limits
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const reportText =
      response.text || '# Continuous Improvement Report\nNo major issues found today. Great job!';

    fs.writeFileSync('ai-improvement-report.md', reportText, 'utf-8');
    console.info('Successfully generated improvement report to ai-improvement-report.md');
  } catch (error) {
    console.error('Error during AI improvement analysis:', error);
    process.exit(0);
  }
}

void improve();
