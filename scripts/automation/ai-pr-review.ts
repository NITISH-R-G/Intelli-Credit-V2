import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';

async function reviewPR() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Exiting ai-pr-review.ts gracefully.');
    process.exit(0);
  }

  const diffPath = 'pr-diff.txt';
  if (!fs.existsSync(diffPath)) {
    console.error('pr-diff.txt does not exist.');
    process.exit(1);
  }

  let diffText = '';
  try {
    diffText = fs.readFileSync(diffPath, 'utf8');
  } catch (err) {
    console.error('Failed to read pr-diff.txt', err);
    process.exit(1);
  }

  if (!diffText.trim()) {
    console.info('No changes detected in PR diff. Exiting.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are a senior staff engineer AI maintainer.
Please review the following Pull Request diff. Identify bugs, performance issues, security concerns, or style violations.
Suggest clear, actionable fixes and maintain a helpful, encouraging tone. Do not output anything other than the review content itself.

PR Diff:
${diffText}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const aiResponseText = response.text || 'No findings from AI review.';

    fs.writeFileSync('pr-comment.txt', aiResponseText);
    console.info('Successfully generated PR review comment.');
  } catch (err) {
    console.error('Failed to generate AI response.', err);
    process.exit(1);
  }
}

void reviewPR();
