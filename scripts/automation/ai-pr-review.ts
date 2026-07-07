import { GoogleGenAI } from '@google/genai';
import { execFileSync } from 'node:child_process';

const apiKey = process.env.GEMINI_API_KEY;

async function run() {
  if (!apiKey) {
    console.warn('No GEMINI_API_KEY provided. Skipping AI PR Review.');
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  const baseRef = process.env.BASE_REF;
  const headRef = process.env.HEAD_REF;

  if (!baseRef || !headRef) {
    console.warn('BASE_REF or HEAD_REF missing. Skipping AI PR Review.');
    return;
  }

  try {
    const diff = execFileSync('git', ['diff', `origin/${baseRef}...origin/${headRef}`], {
      encoding: 'utf-8',
    });
    if (!diff.trim()) {
      console.info('No changes found in PR.');
      return;
    }

    const prompt = `You are a senior staff engineer reviewing a pull request. Review the following git diff and provide constructive feedback, security concerns, and improvement suggestions in Markdown format:\n\n${diff.substring(0, 30000)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    console.info(response.text || 'No review generated.');
  } catch (error) {
    console.error('Error during AI PR Review:', error);
  }
}

run();
