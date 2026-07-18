import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import { execFileSync } from 'child_process';

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.info('GEMINI_API_KEY not found. Skipping AI PR review.');
    process.exit(0);
  }

  const baseRef = process.env.BASE_REF;
  const headRef = process.env.HEAD_REF;

  if (!baseRef || !headRef) {
    console.warn('BASE_REF or HEAD_REF not found.');
    process.exit(0);
  }

  try {
    const diff = execFileSync('git', ['diff', `origin/${baseRef}...HEAD`], { encoding: 'utf-8' });

    if (!diff) {
      console.info('No differences found.');
      process.exit(0);
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Review the following pull request diff and provide actionable feedback, identifying any potential bugs, security issues, or code quality improvements:

${diff}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const comment = response.text;
    fs.writeFileSync('pr-review-comment.txt', comment || 'No feedback generated.');
    console.info('Successfully generated PR review comment.');
  } catch (error) {
    console.error('Error in PR review:', error);
    process.exit(1);
  }
}

main();
