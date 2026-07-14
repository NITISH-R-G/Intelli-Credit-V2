import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function reviewPR() {
  const baseRef = process.env.BASE_REF;
  if (!baseRef) {
    console.warn('No BASE_REF environment variable provided. Skipping PR review.');
    writeFileSync('pr_review.md', 'No BASE_REF provided, skipping review.');
    return;
  }

  if (!/^[a-zA-Z0-9_.-]+$/.test(baseRef)) {
    console.warn('Invalid BASE_REF format.');
    writeFileSync('pr_review.md', 'Invalid BASE_REF format.');
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('No GEMINI_API_KEY provided. Skipping PR review.');
    writeFileSync('pr_review.md', 'No GEMINI_API_KEY provided. Skipping PR review.');
    return;
  }

  let diff = '';
  try {
    diff = execFileSync('git', ['diff', `origin/${baseRef}...HEAD`], { encoding: 'utf-8' });
  } catch (error) {
    console.error('Failed to get git diff:', error);
    return;
  }

  if (!diff) {
    console.info('No diff found. PR review complete.');
    writeFileSync('pr_review.md', 'No changes detected.');
    return;
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = `Review the following git diff for a pull request. Identify any bugs, security vulnerabilities, performance issues, or style violations. Provide constructive feedback and suggestions for improvement.
Diff:
${diff}

Output format: Markdown format suitable for a GitHub pull request comment.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const review = response.text || 'AI could not generate a review.';
    writeFileSync('pr_review.md', review);
    console.info('PR review generated and saved to pr_review.md');
  } catch (error) {
    console.error('Failed to generate PR review with AI:', error);
    writeFileSync('pr_review.md', 'Failed to generate review due to AI error.');
  }
}

reviewPR();
