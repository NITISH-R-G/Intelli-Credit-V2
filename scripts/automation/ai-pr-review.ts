import * as fs from 'node:fs';
import { initGenAI } from './utils.js';

async function reviewPR(): Promise<void> {
  const ai = initGenAI();
  if (!ai) return;

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !fs.existsSync(eventPath)) {
    console.error('GITHUB_EVENT_PATH not found or invalid.');
    process.exit(1);
  }

  const diffPath = 'pr-diff.txt';
  if (!fs.existsSync(diffPath)) {
    console.error(
      'pr-diff.txt not found. Please ensure it is generated before running this script.',
    );
    process.exit(1);
  }

  const payload = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const pr = payload.pull_request;
  const diff = fs.readFileSync(diffPath, 'utf8');

  if (!pr) {
    console.warn('No pull_request found in payload.');
    process.exit(0);
  }

  if (!diff.trim()) {
    console.warn('Diff is empty. Skipping review.');
    process.exit(0);
  }

  const prompt = `You are a strict, highly skilled principal engineer reviewing a PR for Intelli-Credit.
PR Title: ${pr.title}
PR Body: ${pr.body || 'No description provided.'}

Here is the diff:
${diff.slice(0, 15000)} // Truncating to avoid massive diff sizes just in case

Please provide a thorough code review. Look for bugs, security issues, performance problems, and maintainability concerns.
Do not nitpick minor formatting if it is handled by Prettier. If the code looks good, state that clearly and concisely. Provide actionable feedback.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const feedback = response.text || 'Review completed. Please ensure all checks pass.';
    fs.writeFileSync('pr-comment.txt', feedback);
    console.info('PR review comment generated successfully.');
  } catch (err: unknown) {
    console.error('Failed to generate PR review comment:', err);
    process.exit(1);
  }
}

void reviewPR();
