import { GoogleGenAI } from '@google/genai';
import { execFileSync } from 'child_process';
import * as fs from 'fs';

async function analyzeRepo() {
  console.info('Starting Repository Analysis...');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info(
      'GEMINI_API_KEY environment variable is missing. Skipping Repository Analysis (likely running from a fork without secrets).',
    );
    process.exit(0);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });

    let fileList = '';
    try {
      const files = execFileSync('git', ['ls-files'], { encoding: 'utf-8' });
      fileList = files;
    } catch (error) {
      console.warn('Could not read git tracked files.', error);
    }

    const prompt = `Analyze this repository file structure and provide a high-level summary of its architecture, key components, and intended functionality. Output as Markdown.\n\nFiles:\n${fileList}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    console.info('Repository Analysis Complete.');

    fs.mkdirSync('docs/architecture', { recursive: true });
    fs.writeFileSync('docs/architecture/repo-analysis.md', response.text);
    console.info('Saved analysis to docs/architecture/repo-analysis.md');
  } catch (error) {
    console.error('Error during repository analysis:', error);
    process.exit(1);
  }
}

analyzeRepo();
