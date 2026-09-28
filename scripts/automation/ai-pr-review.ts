import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function reviewPR(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('No GEMINI_API_KEY provided. Skipping PR review.');
    process.exit(0);
  }

  let diff = '';
  try {
    diff = fs.readFileSync('pr-diff.txt', 'utf-8');
  } catch {
    console.info('No pr-diff.txt found. Skipping PR review.');
    process.exit(0);
  }

  if (!diff.trim()) {
    console.info('Empty diff. Skipping PR review.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are a senior open-source maintainer and strict code reviewer.
Review the following pull request diff. Look for:
1. Bugs or logic errors.
2. Security vulnerabilities.
3. Performance issues.
4. Violations of best practices (e.g., missing type="button" on React buttons, using console.log instead of console.info, missing void on unawaited promises).

Provide actionable feedback. If everything looks good, simply reply "LGTM! The code looks solid.".

Diff:
${diff}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    const text = response.text;
    if (text) {
      fs.writeFileSync('pr-comment.txt', text);
      console.info('PR review comment generated successfully.');
    }
  } catch (error) {
    console.error('Failed to generate PR review comment:', error);
    process.exit(0);
  }
}

reviewPR().catch(console.error);
