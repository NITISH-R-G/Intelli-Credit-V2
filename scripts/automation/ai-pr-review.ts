import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('GEMINI_API_KEY not found. Skipping PR Review.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

async function reviewPR() {
  let diff = '';
  try {
    diff = fs.readFileSync('pr-diff.txt', 'utf-8');
  } catch (e) {
    console.warn('pr-diff.txt not found, skipping review.', e);
    return;
  }

  if (!diff) {
    console.warn('Diff is empty, skipping review.');
    return;
  }

  const prompt = `
    You are an expert code reviewer.

    Review the following git diff and provide a constructive, technical code review.
    Point out potential bugs, security issues, performance concerns, or style violations.
    If the code looks good, express approval.
    Be concise.

    Diff:
    ${diff.substring(0, 10000)} // Truncate to avoid context limits
    `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    fs.writeFileSync('pr-comment.txt', response.text || 'LGTM! (Automated Review)');
    console.info('PR Review complete. Comment saved to pr-comment.txt');
  } catch (e) {
    console.error('Error during PR review', e);
  }
}

void reviewPR();
export {};
