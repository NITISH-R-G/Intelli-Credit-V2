import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function reviewPR(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Skipping PR review.');
    process.exit(0);
  }

  let diffText = '';
  try {
    diffText = fs.readFileSync('pr-diff.txt', 'utf8');
  } catch (err) {
    console.error('Could not read pr-diff.txt:', err);
    process.exit(1);
  }

  if (!diffText.trim()) {
    console.info('PR diff is empty.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are a senior staff engineer performing a pull request review.
Review the following git diff and provide constructive feedback on code quality, potential bugs, security concerns, and performance.

Diff:
${diffText}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    fs.writeFileSync('pr-comment.txt', response.text ?? 'No review comments generated.');
    console.info('PR review comment generated successfully.');
  } catch (error) {
    console.error('Failed to generate PR review comment:', error);
    process.exit(1);
  }
}

void reviewPR();
