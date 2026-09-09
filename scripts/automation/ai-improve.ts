import * as fs from 'node:fs';
import * as path from 'node:path';
import { GoogleGenAI } from '@google/genai';

function getFilesRecursively(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFilesRecursively(filePath, fileList);
    } else {
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        fileList.push(filePath);
      }
    }
  }

  return fileList;
}

async function improve(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set, skipping AI continuous improvement');
    process.exit(0);
  }

  // Get core files
  const directoriesToScan = ['src', 'api', 'scripts'];
  let allFiles: string[] = [];

  for (const dir of directoriesToScan) {
    if (fs.existsSync(dir)) {
      allFiles = allFiles.concat(getFilesRecursively(dir));
    }
  }

  // Sample files
  const maxFiles = 10;
  const sampledFiles = allFiles.sort(() => 0.5 - Math.random()).slice(0, maxFiles);

  let codebaseContext = '';
  for (const file of sampledFiles) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      codebaseContext += `\n\n--- File: ${file} ---\n\`\`\`typescript\n${content}\n\`\`\`\n`;
    } catch (e) {
      console.warn(`Failed to read file ${file}`, e);
    }
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are an expert AI system architect and maintainer analyzing a repository for continuous improvement.
Analyze the following sampled codebase files and identify:
1. Technical debt
2. Architectural weaknesses
3. Security risks
4. Performance issues
5. Refactoring opportunities

Sampled Codebase:
${codebaseContext}

Generate a comprehensive Markdown report containing your findings and actionable recommendations for improvement.
Ensure your response is formatted as a GitHub issue body. Do not include a title, just the body of the issue.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text || 'No significant improvements identified in this cycle.';

    fs.mkdirSync('docs/history', { recursive: true });
    fs.writeFileSync('docs/history/ai-improvement-report.md', report, 'utf-8');

    console.info('Successfully generated AI improvement report');
  } catch (error) {
    console.error('Failed to generate AI improvement report', error);
    process.exit(1);
  }
}

void improve();
