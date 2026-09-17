import * as fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('GEMINI_API_KEY not found. Exiting gracefully.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

async function reviewPR() {
  try {
    let diff = '';
    try {
      diff = fs.readFileSync('pr-diff.txt', 'utf-8');
    } catch (e) {
      console.warn('Could not read pr-diff.txt. Diff might be empty.');
    }

    if (!diff) {
      console.warn('Empty PR diff.');
      return;
    }

    const prompt = `You are an expert AI PR reviewer. Review the following Git diff for code quality, security issues, potential bugs, performance, and best practices. Provide actionable feedback.

Diff:
\`\`\`diff
${diff}
\`\`\`

Format your response in Markdown. Point out specific lines or files if necessary. Keep it professional and helpful.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    fs.writeFileSync('pr-comment.txt', response.text);
    console.info('Successfully generated PR review comment.');
  } catch (error) {
    console.error('Error during PR review:', error);
    process.exit(1);
  }
}

void reviewPR();
