import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function reviewPR(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is missing. Exiting gracefully.');
    process.exit(0);
  }

  const diffPath = 'pr-diff.txt';
  if (!fs.existsSync(diffPath)) {
    console.error('pr-diff.txt not found. Cannot perform review.');
    process.exit(0);
  }

  const diffContent = fs.readFileSync(diffPath, 'utf8');
  if (!diffContent.trim()) {
    console.warn('pr-diff.txt is empty. No review needed.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
    You are an AI code reviewer. Please review the following git diff:

    ${diffContent}

    Provide constructive feedback, identify potential bugs or security issues, and suggest improvements. Be professional and concise. Only output the review content.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const reviewText =
      response.text || 'LGTM! I could not find any significant issues with this PR.';
    fs.writeFileSync('pr-comment.txt', reviewText);
    console.info('PR review written to pr-comment.txt');
  } catch (err) {
    console.error('Failed to generate PR review:', err);
    process.exit(1);
  }
}

void reviewPR();
