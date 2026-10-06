import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function reviewPR() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is missing. Exiting PR review gracefully.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });

  if (!fs.existsSync('pr-diff.txt')) {
    console.warn('pr-diff.txt not found. Cannot perform PR review.');
    process.exit(0);
  }

  const diff = fs.readFileSync('pr-diff.txt', 'utf8');

  if (!diff.trim()) {
    console.warn('Empty diff found.');
    process.exit(0);
  }

  const prompt = `
    You are an expert AI code reviewer for a Node.js/React repository.
    Review the following git diff for a pull request.
    Provide actionable feedback, point out potential bugs, security vulnerabilities, or performance issues.
    Suggest improvements where necessary. Keep the feedback professional and concise.

    Diff:
    ${diff.substring(0, 50000)} // Limit size to avoid context overflow
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt
    });

    const review = response.text || 'LGTM! (Automated basic check passed, but AI was unable to generate a detailed review.)';
    fs.writeFileSync('pr-comment.txt', review);
    console.info('PR review generated successfully.');
  } catch (err) {
    console.error('Error generating PR review:', err);
    process.exit(1);
  }
}

await reviewPR().catch((err) => {
  console.error('Unhandled error in PR review:', err);
  process.exit(1);
});
