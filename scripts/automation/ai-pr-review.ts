import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function prReview(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('GEMINI_API_KEY is not set. Gracefully exiting AI PR review.');
    process.exit(0);
  }

  let diffContent = '';
  try {
    diffContent = fs.readFileSync('pr-diff.txt', { encoding: 'utf-8' });
  } catch (error) {
    console.error('Failed to read pr-diff.txt:', error);
    process.exit(1);
  }

  if (!diffContent.trim()) {
    console.info('No diff found. Exiting.');
    process.exit(0);
  }

  const aiClient = new GoogleGenAI({ apiKey });

  const prompt = `You are a senior staff engineer performing a pull request code review.
Please review the following git diff. Point out bugs, architectural flaws, security issues, performance regressions, and style violations.
Suggest clear, actionable fixes. Be concise and professional.

Diff:
${diffContent}`;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    if (response.text) {
      fs.writeFileSync('pr-comment.txt', response.text, { encoding: 'utf-8' });
      console.info('Successfully generated PR review comment to pr-comment.txt');
    } else {
      console.error('Empty response from GenAI.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Failed to generate PR review:', error);
    process.exit(1);
  }
}

void prReview();
