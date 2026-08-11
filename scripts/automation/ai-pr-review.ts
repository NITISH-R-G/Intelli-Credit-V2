import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';

async function reviewPR(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('GEMINI_API_KEY is not set. Skipping AI PR review.');
    process.exit(0);
  }

  const diffPath = 'pr-diff.txt';
  if (!fs.existsSync(diffPath)) {
    console.warn('pr-diff.txt not found. Cannot review PR.');
    return;
  }

  const diff = fs.readFileSync(diffPath, 'utf8');

  if (!diff.trim()) {
    console.info('Empty diff. Nothing to review.');
    return;
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `You are an expert AI software engineer reviewing a pull request for the Intelli-Credit Terminal repository.
Please review the following git diff and provide a constructive, concise review (less than 400 words). Point out any security concerns, bugs, or code quality issues. If the code looks good, express approval.

Diff:
${diff}`,
    });

    const comment = response.text;
    fs.writeFileSync(
      'pr-comment.txt',
      comment || 'Thank you for your PR. A maintainer will review it shortly.',
    );
    console.info('AI PR Review completed successfully.');
  } catch (error) {
    console.error('Error during AI PR Review:', error);
  }
}

void reviewPR();
