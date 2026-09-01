import * as fs from 'node:fs';
import * as path from 'node:path';
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

async function improve(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('GEMINI_API_KEY is not set. Exiting ai-improve gracefully.');
    process.exit(0);
  }

  try {
    const srcFiles = getFiles('src');
    const apiFiles = getFiles('api');
    const scriptsFiles = getFiles('scripts');

    const allFiles = [...srcFiles, ...apiFiles, ...scriptsFiles];

    let codebaseContent = '';
    for (const file of allFiles) {
      codebaseContent += `\n\n--- File: ${file} ---\n`;
      codebaseContent += fs.readFileSync(file, 'utf8');
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an AI continuous improvement system. Analyze the following codebase and provide recommendations for:
1. Technical debt reduction
2. Code quality improvements
3. Architecture optimizations
4. Security enhancements

Codebase:
${codebaseContent}

Provide your recommendations in Markdown format.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const aiResponse = response.text || 'No recommendations generated.';

    fs.mkdirSync('docs/history', { recursive: true });
    fs.writeFileSync('docs/history/ai-improvement-report.md', aiResponse);
    console.info('Improvement report written to docs/history/ai-improvement-report.md');
  } catch (err) {
    console.error('Error during AI improve:', err);
    process.exit(1);
  }
}

void improve();
