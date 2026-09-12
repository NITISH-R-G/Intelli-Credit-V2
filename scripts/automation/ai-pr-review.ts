import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';

async function reviewPR() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('No GEMINI_API_KEY found, skipping PR review.');
    process.exit(0);
  }

  let diff = '';
  try {
    diff = fs.readFileSync('pr-diff.txt', 'utf-8');
  } catch (err) {
    console.error('Could not read pr-diff.txt:', err);
    process.exit(1);
  }

  if (!diff.trim()) {
    console.warn('PR diff is empty, skipping review.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert AI code reviewer for the Intelli-Credit repository.
Please review the following Pull Request diff.

Provide a concise, constructive, and actionable review.
Focus on:
1. Security vulnerabilities.
2. Code quality and maintainability.
3. Potential bugs.
4. Architecture and best practices.

Diff:
${diff}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    fs.writeFileSync(
      'pr-comment.txt',
      response.text || 'LGTM, but could not generate detailed review.',
    );
    console.info('PR review comment generated successfully.');
  } catch (error) {
    console.error('Failed to generate PR review:', error);
    process.exit(1);
  }
}

void reviewPR();
