import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.info('GEMINI_API_KEY not provided. Skipping AI PR review.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });
const model = 'gemini-2.0-flash';

async function reviewPR(): Promise<void> {
  try {
    if (!fs.existsSync('pr-diff.txt')) {
      console.info('pr-diff.txt not found. Nothing to review.');
      process.exit(0);
    }

    const diffText = fs.readFileSync('pr-diff.txt', 'utf-8');

    if (!diffText || diffText.trim().length === 0) {
      console.info('PR diff is empty.');
      process.exit(0);
    }

    const prompt = `You are an expert code reviewer acting as a senior staff engineer.
Please review the following git diff.
Look for security issues, performance problems, bugs, architectural concerns, and violations of best practices.
Provide a clear, polite, and actionable review.

Diff:
${diffText}`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    const reviewText = response.text;

    if (reviewText) {
      fs.writeFileSync('pr-comment.txt', reviewText, 'utf-8');
      console.info('PR review comment generated successfully.');
    }
  } catch (error) {
    console.error('Failed to run AI PR review:', error);
    process.exit(1);
  }
}

void reviewPR();
