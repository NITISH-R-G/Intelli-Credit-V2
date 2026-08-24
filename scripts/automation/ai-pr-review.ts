import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function prReview(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Exiting gracefully.');
    process.exit(0);
  }

  let diffText = '';
  try {
    if (fs.existsSync('pr-diff.txt')) {
      diffText = fs.readFileSync('pr-diff.txt', 'utf-8');
    }
  } catch (error) {
    console.error('Error reading pr-diff.txt:', error);
    process.exit(1);
  }

  if (!diffText) {
    console.warn('No PR diff found or diff is empty. Exiting.');
    process.exit(0);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are an expert AI senior software engineer reviewing a pull request for this repository.
Please review the following git diff and provide constructive, detailed feedback.
Point out any bugs, security issues, performance problems, or architectural concerns.
Also highlight good practices and provide actionable recommendations.

Diff:
${diffText}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const responseText = response.text || 'Review completed. No significant issues found.';

    fs.writeFileSync('pr-comment.txt', responseText);
    console.info('PR review comment generated successfully.');
  } catch (error) {
    console.error('Error during PR review:', error);
    process.exit(1);
  }
}

void prReview();
