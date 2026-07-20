import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.info('GEMINI_API_KEY is not set. Skipping AI PR review.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });
const prDiff = process.env.PR_DIFF || '';

async function reviewPR() {
  if (!prDiff) {
    console.info('No PR diff provided. Skipping AI PR review.');
    process.exit(0);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `You are an expert AI code reviewer for the Intelli-Credit-V2 repository.
Analyze the following pull request diff and provide a constructive review.
Focus on:
- Code quality and maintainability
- Security vulnerabilities
- Potential bugs or edge cases
- Adherence to project conventions (e.g., no console.log, proper error handling)
- Provide specific, actionable feedback or code suggestions.

PR Diff:
${prDiff}`,
    });

    const comment = response.text;
    if (comment) {
      fs.writeFileSync('pr-review.txt', comment, 'utf-8');
      console.info('Successfully generated PR review comment.');
    } else {
      console.warn('AI generated an empty response.');
    }
  } catch (error) {
    console.error('Error during AI PR review:', error);
    process.exit(0); // Graceful exit
  }
}

reviewPR();
