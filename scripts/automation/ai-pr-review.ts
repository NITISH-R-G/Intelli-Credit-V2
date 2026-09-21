import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';

async function reviewPr(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Skipping PR Review.');
    process.exit(0);
  }

  if (!fs.existsSync('pr-diff.txt')) {
    console.warn('pr-diff.txt not found.');
    process.exit(0);
  }

  try {
    const diff = fs.readFileSync('pr-diff.txt', 'utf8');
    if (!diff.trim()) {
      console.warn('Empty PR diff.');
      process.exit(0);
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Please review the following PR diff. Point out any security issues, bugs, or style violations:\n\n${diff}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const review = response.text;
    if (review) {
      fs.writeFileSync('pr-comment.txt', review);
      console.info('PR review comment generated.');
    } else {
      console.warn('Empty response from AI.');
    }
  } catch (e) {
    console.error(e);
  }
}

reviewPr().catch(() => {});
