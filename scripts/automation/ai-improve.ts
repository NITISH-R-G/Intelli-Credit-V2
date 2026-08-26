import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

function getTsFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = `${dir}/${file}`;
    if (fs.statSync(filePath).isDirectory()) {
      getTsFiles(filePath, fileList);
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

async function improve(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Skipping improvement loop.');
    process.exit(0);
  }

  console.info('Gathering repository information...');
  const keyDirs = ['src', 'api', 'scripts'];
  let repoContext = '';

  for (const dir of keyDirs) {
    if (fs.existsSync(dir)) {
      const files = getTsFiles(dir);
      for (const file of files) {
        try {
          const content = fs.readFileSync(file, 'utf-8');
          // simple truncate to not overload token limit
          repoContext += `\n--- File: ${file} ---\n${content.substring(0, 500)}...\n`;
        } catch (e) {
          console.warn(`Could not read ${file}`);
        }
      }
    }
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are the AI maintainer for the Intelli-Credit repository.
Analyze the following repository structure and partial file contents to suggest improvements.
Look for:
- Technical debt
- Missing documentation
- Security risks
- Architectural concerns

Repository Context:
${repoContext}

Provide a detailed report in Markdown format with actionable recommendations.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    const text = response.text || '';

    fs.mkdirSync('docs/history', { recursive: true });
    fs.writeFileSync('docs/history/ai-improvement-report.md', text);
    console.info('Successfully generated AI improvement report.');
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    process.exit(1);
  }
}

void improve();
