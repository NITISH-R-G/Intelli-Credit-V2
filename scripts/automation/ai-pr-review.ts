import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Skipping AI PR Review.');
    process.exit(0);
  }

  try {
    if (!fs.existsSync('pr-diff.txt')) {
      console.warn('pr-diff.txt not found. Cannot perform PR review.');
      process.exit(0);
    }

    const diff = fs.readFileSync('pr-diff.txt', 'utf-8');

    if (!diff || diff.trim() === '') {
      console.info('No diff found. Nothing to review.');
      process.exit(0);
    }

    const prompt = `You are a senior staff software engineer reviewing a pull request.
    Please review the following git diff and provide constructive, detailed feedback.
    Point out potential bugs, security issues, performance problems, and suggest improvements.
    Keep the feedback concise and actionable.

    Diff:
    ${diff}
    `;

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const aiText = response.text;
    if (aiText) {
      fs.writeFileSync('pr-comment.txt', aiText);
      console.info('PR review comment written to pr-comment.txt');
    }
  } catch (err) {
    console.error('Error during AI PR review:', err);
    process.exit(1);
  }
}

void main();
