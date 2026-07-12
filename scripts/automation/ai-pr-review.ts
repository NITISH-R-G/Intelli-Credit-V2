import { GoogleGenAI } from '@google/genai';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';

async function main() {
  console.info('Starting AI PR Review...');

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is missing.');
    throw new Error('Fatal Error');
  }

  const baseRef = process.env.BASE_REF;
  if (!baseRef) {
    console.error('BASE_REF environment variable is missing.');
    throw new Error('Fatal Error');
  }

  let diff = '';
  try {
    diff = execFileSync('git', ['diff', `origin/${baseRef}...HEAD`], { encoding: 'utf-8' });
  } catch (e) {
    console.error('Could not compute git diff', e);
    throw new Error('Fatal Error');
  }

  if (!diff) {
    console.info('No differences found. Exiting.');
    fs.writeFileSync('pr-review.md', 'No changes detected.');
    return;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `
    You are a senior staff engineer acting as an AI maintainer for the Intelli-Credit open-source repository.
    Review the following git diff for a pull request.
    Analyze for code quality, security concerns, performance regressions, architecture alignment, and provide a constructive review.

    Git Diff:
    \`\`\`diff
    ${diff}
    \`\`\`

    Format your response as a comprehensive markdown comment ready to be posted on the PR. Include a summary and specific file comments.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    console.info('PR Review Generated.');
    fs.writeFileSync('pr-review.md', response.text || 'No review generated.');
  } catch (error) {
    console.error('Failed to run AI PR review:', error);
    throw new Error('Fatal Error');
  }
}

main();
