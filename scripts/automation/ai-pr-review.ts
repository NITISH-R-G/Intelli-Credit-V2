import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function review() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Exiting PR review.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });

  const diffPath = 'pr-diff.txt';
  if (!fs.existsSync(diffPath)) {
    console.error('pr-diff.txt not found.');
    process.exit(1);
  }

  const diffContent = fs.readFileSync(diffPath, 'utf-8');

  const prompt = `
  You are an AI maintainer for the Intelli-Credit project.
  Review the following pull request diff and provide feedback, suggestions, and identify any issues or improvements.

  Diff:
  ${diffContent}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    fs.writeFileSync('pr-comment.txt', response.text || '');
    console.info('PR review comment generated successfully.');
  } catch (error: unknown) {
    console.error(
      'Error calling Gemini API for PR review',
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }
}

void review();
