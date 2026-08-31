import * as fs from 'node:fs';
import * as path from 'node:path';
import { GoogleGenAI } from '@google/genai';

function getFilesRecursively(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFilesRecursively(filePath, fileList);
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

async function improve(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set. Skipping improvement loop.');
    process.exit(0);
  }

  const dirsToScan = ['src', 'api', 'scripts'];
  let allCode = '';

  for (const dir of dirsToScan) {
    const files = getFilesRecursively(dir);
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      allCode += `\n\n--- ${file} ---\n\n${content}`;
    }
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert open-source maintainer and software architect analyzing a repository for continuous improvement.
Review the following code and suggest architecture improvements, security fixes, and technical debt reductions.
Output the results in Markdown format.

Code:
${allCode}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text;
    if (report) {
      fs.mkdirSync('docs/history', { recursive: true });
      fs.writeFileSync('docs/history/ai-improvement-report.md', report);
      console.info('Improvement report generated successfully.');
    } else {
       console.error('No response from Gemini.');
       process.exit(1);
    }
  } catch (error) {
    console.error('Error generating improvement report:', error);
    process.exit(1);
  }
}

improve().catch((error) => {
  console.error('Unhandled error in improve:', error);
  process.exit(1);
});
