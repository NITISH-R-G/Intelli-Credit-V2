import * as fs from 'node:fs';
import * as path from 'node:path';
import { GoogleGenAI } from '@google/genai';

function getFilesRecursively(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!filePath.includes('node_modules') && !filePath.includes('dist') && !filePath.includes('.git')) {
        getFilesRecursively(filePath, fileList);
      }
    } else {
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.md')) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

async function improveRepo(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {

    console.warn('GEMINI_API_KEY is not set. Exiting ai-improve successfully.');
    process.exit(0);
  }

  const allFiles = getFilesRecursively('.');
  const coreFiles = allFiles.filter(f => f.includes('src/') || f.includes('api/') || f.includes('scripts/') || f === 'README.md');
  const otherFiles = allFiles.filter(f => !coreFiles.includes(f));

  // Randomly sample up to 5 non-core files to stay within context limits
  const sampledOtherFiles = otherFiles.sort(() => 0.5 - Math.random()).slice(0, 5);

  // Also limit core files if there are too many (e.g. max 15)
  const sampledCoreFiles = coreFiles.sort(() => 0.5 - Math.random()).slice(0, 15);

  const filesToAnalyze = [...sampledCoreFiles, ...sampledOtherFiles];
  let contextStr = '';

  for (const file of filesToAnalyze) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      contextStr += `\n\n--- File: ${file} ---\n${content.substring(0, 5000)}`; // Limit file size
    } catch (err) {

      console.warn(`Could not read file ${file}`, err);
    }
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
You are an expert AI architect continuously analyzing the Intelli-Credit Terminal repository.
Based on the following sample of repository files, generate a Continuous Improvement Report.
Identify weaknesses, technical debt, documentation gaps, security risks, performance issues, or architectural concerns.
Provide actionable recommendations.

Codebase Sample:
${contextStr}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const reportText = response.text || 'No significant issues found today.';
    const dateStr = new Date().toISOString().split('T')[0];
    const reportFullText = `# AI Continuous Improvement Report (${dateStr})\n\n${reportText}`;

    fs.mkdirSync('docs/history', { recursive: true });
    fs.writeFileSync('docs/history/ai-improvement-report.md', reportFullText);

    console.info('Successfully generated AI improvement report to docs/history/ai-improvement-report.md');
  } catch (error) {

    console.error('Error calling Google GenAI:', error);
    process.exit(1);
  }
}

void improveRepo();
