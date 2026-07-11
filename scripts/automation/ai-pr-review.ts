import { GoogleGenAI } from '@google/genai';
import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

async function main() {
  // Ensure the file exists so the GitHub Action step doesn't fail
  writeFileSync('pr-review-comment.md', 'AI PR Reviewer: Review could not be generated.');

  const baseRef = process.env.BASE_REF;
  const headRef = process.env.HEAD_REF;

  if (!baseRef || !headRef) {
    console.error('BASE_REF or HEAD_REF environment variables are missing.');
    process.exit(1);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('No GEMINI_API_KEY found, skipping AI PR review.');
    writeFileSync(
      'pr-review-comment.md',
      'AI PR Reviewer: No GEMINI_API_KEY found. Skipping review.',
    );
    return;
  }

  try {
    console.info(`Fetching diff between origin/${baseRef} and ${headRef}`);
    execFileSync('git', ['fetch', 'origin', baseRef]);

    // We get diff relative to origin/baseRef since GitHub Actions checkout might be detached
    let diff = '';
    try {
      diff = execFileSync('git', ['diff', `origin/${baseRef}...HEAD`]).toString();
    } catch {
      diff = execFileSync('git', ['diff', `origin/${baseRef}`, 'HEAD']).toString();
    }

    if (!diff.trim()) {
      console.info('No diff found. Exiting.');
      writeFileSync('pr-review-comment.md', 'AI PR Reviewer: No changes found to review.');
      return;
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are a senior staff engineer reviewing a pull request for the Intelli-Credit Terminal repository.
Analyze the following Git diff and provide a concise, constructive code review.
Focus on potential bugs, security issues, performance, and architecture.
Format your review nicely in Markdown.

Diff:
\`\`\`diff
${diff}
\`\`\`
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });

    const feedback = response.text || 'No review generated.';
    const finalComment = `## 🤖 AI Pull Request Review\n\n${feedback}`;

    writeFileSync('pr-review-comment.md', finalComment);
    console.info('PR review generated and saved to pr-review-comment.md');
  } catch (error) {
    console.error('Error during AI PR review:', error);
  }
}

main().catch(console.error);
