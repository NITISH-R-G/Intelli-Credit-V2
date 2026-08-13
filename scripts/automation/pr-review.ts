import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';

async function reviewPR(): Promise<void> {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not set. Skipping PR review.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const diffPath = 'pr-diff.txt';

  if (!fs.existsSync(diffPath)) {
    console.warn('pr-diff.txt not found. Skipping PR review.');
    process.exit(0);
  }

  try {
    const diff = fs.readFileSync(diffPath, 'utf8');

    if (!diff.trim()) {
      console.warn('PR diff is empty.');
      process.exit(0);
    }

    const prompt = `
      You are an AI maintainer reviewing a pull request for the Intelli-Credit Terminal project.
      Please review the following git diff and provide a code review.
      Focus on code quality, security, and potential bugs.
      If there are actionable findings, provide a concise summary.
      If the diff looks good, provide a brief approval message.

      Git Diff:
      ${diff}

      Format the output as a GitHub comment in Markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const comment = response.text || 'The pull request has been reviewed.';

    fs.writeFileSync('pr-comment.txt', comment);
    console.info('PR review comment written to pr-comment.txt');
  } catch (error) {
    console.error('Error during PR review:', error);
    process.exit(1);
  }
}

void reviewPR();
