import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { GoogleGenAI } from '@google/genai';

async function reviewPR() {
  console.info('Starting AI PR review...');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY environment variable is not set. Skipping AI review generation.');
    return;
  }

  const ai = new GoogleGenAI({ apiKey });

  const baseRef = process.env.BASE_REF;
  if (!baseRef) {
    console.warn('BASE_REF environment variable is not set. Cannot determine diff base.');
    process.exit(1);
  }

  let diffOutput = '';
  try {
    diffOutput = execFileSync('git', ['diff', `origin/${baseRef}...HEAD`], { encoding: 'utf-8' });
  } catch (err) {
    console.error('Failed to get git diff', err);
    process.exit(1);
  }

  if (!diffOutput.trim()) {
    console.info('No changes to review.');
    return;
  }

  try {
    const prompt = `Review the following pull request diff. Provide a summary of the changes and any specific recommendations for code quality, security, or potential bugs:\n\n${diffOutput}`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const commentContent = response.text || 'No review generated.';

    // Write the output to a file that the GitHub Action can pick up
    fs.writeFileSync('pr-review-comment.md', commentContent, 'utf-8');

    console.info('AI PR review generated successfully.');
  } catch (error) {
    console.error('Failed to generate PR review using Gemini:', error);
    process.exit(1);
  }
}

reviewPR();
