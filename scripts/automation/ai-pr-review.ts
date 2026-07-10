import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function runPRReview() {
  console.info('Starting AI PR Review...');

  const prNumber = process.env.PR_NUMBER;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!prNumber) {
    console.error('PR_NUMBER environment variable is missing.');
    process.exit(1);
  }

  if (!apiKey) {
    console.warn('GEMINI_API_KEY environment variable is missing. Skipping PR review.');
    process.exit(0);
  }

  if (!/^\d+$/.test(prNumber)) {
    console.error('PR_NUMBER is not a valid number.');
    process.exit(1);
  }

  console.info(`Reviewing PR #${prNumber}`);

  try {
    const diff = execFileSync('gh', ['pr', 'diff', prNumber], {
      encoding: 'utf8',
    });
    console.info(`Found diff of length ${diff.length}. Analyzing with AI...`);

    if (diff.trim().length === 0) {
      console.info('Diff is empty. Skipping review.');
      process.exit(0);
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a senior staff engineer reviewing a pull request.
Here is the git diff:
\`\`\`diff
${diff}
\`\`\`

Provide a professional, constructive code review. Point out any security vulnerabilities, performance issues, logic flaws, or violations of best practices. Also highlight what was done well. Format your response in Markdown, ready to be posted as a PR comment. Start with a brief overall assessment.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const reviewFeedback = response.text || 'Failed to generate review.';

    // Save to artifact for thollander/actions-comment-pull-request@v3
    writeFileSync('pr_review.md', reviewFeedback);
    console.info('PR review generated and saved to pr_review.md');
  } catch (error) {
    console.error('Failed to run PR review:', error);
    process.exit(1);
  }
}

runPRReview();
