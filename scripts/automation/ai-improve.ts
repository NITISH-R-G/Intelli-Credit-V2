import { GoogleGenAI } from '@google/genai';
import { execFileSync } from 'child_process';
import * as fs from 'fs';

async function improveRepo() {
  console.info('Starting Continuous Improvement Loop...');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info(
      'GEMINI_API_KEY environment variable is missing. Skipping AI Improvement (likely running from a fork without secrets).',
    );
    process.exit(0);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });

    let fileList = '';
    try {
      const files = execFileSync('git', ['ls-files'], { encoding: 'utf-8' });
      fileList = files.split('\n').slice(0, 100).join('\n'); // Limit to first 100 files for simple context
    } catch (error) {
      console.warn('Could not read git tracked files.', error);
    }

    const prompt = `Analyze this subset of the repository file structure and suggest potential areas of improvement, refactoring, or documentation updates:\n\n${fileList}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    console.info('AI Improvement Suggestions:');
    console.info(response.text);

    fs.mkdirSync('docs/history', { recursive: true });
    fs.writeFileSync('docs/history/improvement-suggestions.md', response.text);
    console.info('Saved suggestions to docs/history/improvement-suggestions.md');
  } catch (error) {
    console.error('Error during AI improvement loop:', error);
    process.exit(1);
  }
}

improveRepo();
