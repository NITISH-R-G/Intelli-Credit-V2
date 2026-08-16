import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

function getFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

async function improveRepo(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Skipping AI improvement loop.');
    process.exit(0);
  }

  const dirsToScan = ['src', 'api', 'scripts'];
  const allFiles: string[] = [];
  dirsToScan.forEach(dir => getFiles(dir, allFiles));

  // Pick a random subset of files to avoid context limits
  const sampleSize = Math.min(5, allFiles.length);
  const selectedFiles = allFiles.sort(() => 0.5 - Math.random()).slice(0, sampleSize);

  let sourceContext = '';
  for (const file of selectedFiles) {
     sourceContext += `\n\n--- File: ${file} ---\n${fs.readFileSync(file, 'utf-8').substring(0, 5000)}`;
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an autonomous AI staff engineer analyzing the repository to find areas of improvement.
Review the following sample of source files from the codebase:

${sourceContext}

Based on this code, suggest exactly 3 high-impact improvements. They could be related to:
- Technical debt
- Performance
- Security
- Code Quality

Format your response as a Markdown report suitable for a GitHub issue body. Include code examples if necessary.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text || "No improvements identified at this time.";
    fs.writeFileSync('ai-improvement-report.md', report);
    console.info('Improvement report written to ai-improvement-report.md');
  } catch (error) {
    console.error('Failed to generate improvement report:', error);
    process.exit(1);
  }
}

improveRepo().catch(console.error);
