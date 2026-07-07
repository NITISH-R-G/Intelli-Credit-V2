import { GoogleGenAI } from '@google/genai';
import { execFileSync } from 'node:child_process';

const apiKey = process.env.GEMINI_API_KEY;

async function run() {
  if (!apiKey) {
    console.warn('No GEMINI_API_KEY provided. Skipping AI Improve.');
    return;
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const gitLog = execFileSync('git', ['log', '-n', '5', '--oneline'], { encoding: 'utf-8' });
    const prompt = `You are an AI maintaining a repository. Review the recent git history and suggest architectural improvements or refactoring ideas.\n\nRecent commits:\n${gitLog}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    console.info('Improvement Suggestions:\n', response.text);
  } catch (error) {
    console.error('Error during AI Improve:', error);
  }
}

run();
