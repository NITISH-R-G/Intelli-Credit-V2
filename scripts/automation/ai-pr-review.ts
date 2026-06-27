import { GoogleGenAI } from '@google/genai';
import { readFileSync, writeFileSync } from 'node:fs';

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not set. Skipping AI PR Review.');
    writeFileSync('ai_review.md', 'AI PR Review skipped: `GEMINI_API_KEY` is not configured in this environment.');
    process.exit(0);
  }

  let diffContent = '';
  try {
    diffContent = readFileSync('pr_diff.txt', 'utf-8');
  } catch (error) {
    console.error('Could not read pr_diff.txt. Proceeding with empty diff.');
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Review this PR diff and provide constructive feedback on potential bugs, security issues, performance, and best practices.

Diff:
\`\`\`diff
${diffContent}
\`\`\`

Generate a concise markdown response for a GitHub comment.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const report = response.text || 'No review generated.';

    // Save report
    writeFileSync('ai_review.md', report);
    console.info('AI review generated at ai_review.md');
  } catch (error) {
    console.error('Error in AI PR Review:', error);
    process.exit(1);
  }
}

main();
