import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function reviewPR(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is missing. Skipping AI PR review.');
    process.exit(0);
  }

  let prDiff = '';
  try {
    prDiff = fs.readFileSync('pr-diff.txt', 'utf8');
  } catch {
    console.warn('pr-diff.txt not found. Skipping PR review.');
    process.exit(0);
  }

  if (!prDiff.trim()) {
    console.info('Empty PR diff. Nothing to review.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert AI open-source maintainer acting as a Staff Engineer.
Please review the following git diff from a Pull Request.

Provide a constructive, detailed code review. Focus on:
1. Potential bugs and logical errors
2. Security vulnerabilities
3. Performance implications
4. Code quality, maintainability, and adherence to best practices
5. Architectural impact

If everything looks great, compliment the author.

Diff:
${prDiff}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    if (response.text) {
        fs.writeFileSync('pr-comment.txt', response.text, 'utf8');
        console.info('PR review comment written to pr-comment.txt');
    }
  } catch (error) {
    console.error('Failed to generate AI PR review', error);
    process.exit(1);
  }
}

void reviewPR();
