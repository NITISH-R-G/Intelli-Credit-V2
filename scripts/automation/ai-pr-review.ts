import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('GEMINI_API_KEY not found. Skipping AI PR Review.');
  process.exit(0);
}

const diffFile = 'pr-diff.txt';
let prDiff = '';
if (fs.existsSync(diffFile)) {
  prDiff = fs.readFileSync(diffFile, 'utf-8');
}

if (!prDiff) {
  console.warn('PR_DIFF is empty. Nothing to review.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

async function reviewPR() {
  try {
    const prompt = `You are a senior AI Pull Request reviewer. Review the following PR diff:

${prDiff}

Provide a constructive code review. Point out any security concerns, performance issues, logic errors, or style violations. Suggest improvements. Be polite and encouraging. Output only the Markdown content for the PR comment.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const comment =
      response.text ||
      'Thank you for this PR! Looks good on a quick glance, but a human reviewer will take a closer look soon.';

    fs.writeFileSync('pr-review-comment.txt', comment);
    console.info('PR review comment successfully written to pr-review-comment.txt');
  } catch (error) {
    console.error('Failed to review PR:', error);
    process.exit(1);
  }
}

reviewPR();
