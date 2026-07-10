import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function analyzeRepo() {
  console.info('Starting repository analysis...');
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY environment variable is missing.');
    process.exit(1);
  }

  if (!existsSync('docs')) {
    mkdirSync('docs', { recursive: true });
  }

  try {
    const fileCount = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
      .trim()
      .split('\n').length;
    const fs = await import('node:fs');
    const packageJson = fs.readFileSync('package.json', 'utf8');

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are an expert system architect analyzing a repository.
Here is the package.json of the project:
\`\`\`json
${packageJson}
\`\`\`
There are ${fileCount} files tracked in this git repository.

Write a high-level Markdown report summarizing the project architecture, tech stack, and testing strategy based solely on this information. Be professional and concise.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    writeFileSync('docs/repository-analysis.md', response.text || 'Analysis failed.');
    console.info('Repository analysis complete and saved to docs/repository-analysis.md');
  } catch (error) {
    console.error('Failed to analyze repository:', error);
    process.exit(1);
  }
}

analyzeRepo();
