import { GoogleGenAI } from '@google/genai';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const apiKey = process.env.GEMINI_API_KEY;

async function reviewPR() {
  const baseRef = process.env.BASE_REF;

  if (!baseRef) {
    console.warn('No BASE_REF found, skipping PR review.');
    return;
  }

  let diff = '';
  try {
    diff = execFileSync('git', ['diff', `origin/${baseRef}...HEAD`], { encoding: 'utf-8' }).toString();
  } catch (error) {
    console.error('Error generating diff:', error instanceof Error ? error.message : error);
    fs.writeFileSync('pr_review.txt', 'Failed to generate git diff for review.');
    return;
  }

  if (!diff || diff.trim() === '') {
    console.info('No changes found in diff.');
    fs.writeFileSync('pr_review.txt', 'No changes found in the diff.');
    return;
  }

  if (!apiKey) {
    console.warn('No GEMINI_API_KEY found, skipping AI PR review.');
    fs.writeFileSync('pr_review.txt', 'GEMINI_API_KEY not found. Skipping AI review.');
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      Review the following pull request diff.
      Identify any potential bugs, security issues, performance problems, or style violations.
      Provide constructive feedback and suggestions for improvement.
      If the code looks good, explicitly state that.

      Diff:
      ${diff}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const reviewText = response.text || 'No review generated.';
    fs.writeFileSync('pr_review.txt', reviewText);
    console.info('PR review generated successfully.');
  } catch (error) {
    console.error('Error during AI PR review:', error instanceof Error ? error.message : error);
    fs.writeFileSync('pr_review.txt', 'An error occurred while generating the AI PR review.');
  }
}

reviewPR().catch((err) => console.error(err instanceof Error ? err.message : err));
