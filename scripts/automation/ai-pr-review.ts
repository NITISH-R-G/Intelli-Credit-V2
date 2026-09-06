import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function prReview(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set. Exiting gracefully.');
    process.exit(0);
  }

  try {
    let diffText = '';
    try {
        diffText = fs.readFileSync('pr-diff.txt', 'utf8');
    } catch (e) {
        console.error('pr-diff.txt not found. Exiting.');
        process.exit(1);
    }

    if (!diffText.trim()) {
        console.info('Empty PR diff. Nothing to review.');
        return;
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert AI software engineer and code reviewer. Analyze the following Git diff and provide a thorough, actionable, and polite code review.
Point out any bugs, security vulnerabilities, performance issues, or style violations. Suggest specific improvements. If the code looks good, mention that as well.

Diff:
${diffText}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    if (response.text) {
        fs.writeFileSync('pr-comment.txt', response.text);
        console.info('Successfully generated PR review comment.');
    } else {
        console.warn('No response text generated from Gemini.');
    }

  } catch (error) {
    console.error('Error during PR review:', error);
    process.exit(1);
  }
}

void prReview();
