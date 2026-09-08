import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function main(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Skipping PR review.');
    process.exit(0);
  }

  try {
    const diff = fs.readFileSync('pr-diff.txt', 'utf8');
    if (!diff.trim()) {
      console.info('No diff found. Exiting.');
      return;
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a senior staff engineer reviewing a pull request for the Intelli-Credit Terminal repository.
Please review the following git diff and provide constructive feedback. Focus on:
1. Code quality, security, and performance.
2. Architecture and design patterns.
3. Potential bugs or edge cases.
4. Adherence to best practices (e.g., using explicit types, handling errors).

Diff:
${diff}

Provide your feedback in Markdown format, prioritizing actionable suggestions.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text;
    if (text) {
      fs.writeFileSync('pr-comment.txt', text, 'utf8');
      console.info('Successfully generated PR review comment.');
    } else {
      console.warn('AI generated an empty response.');
    }
  } catch (error) {
    console.error('Error during PR review:', error);
    process.exit(1);
  }
}

void main();
