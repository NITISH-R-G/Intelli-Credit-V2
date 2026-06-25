import { GoogleGenAI } from '@google/genai';
import { execFileSync } from 'child_process';
import * as fs from 'fs';

async function reviewPR() {
  console.info('Starting AI PR Review...');

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set.');
    fs.writeFileSync('pr_review_output.txt', 'Error: GEMINI_API_KEY is not set.');
    return;
  }

  let diff = '';
  try {
    const output = execFileSync('git', ['diff', 'origin/main...HEAD'], { encoding: 'utf8' });
    diff = output.toString();
  } catch (error) {
    console.error('Error getting git diff:', error);
    try {
      const outputFallback = execFileSync('git', ['diff', 'HEAD~1...HEAD'], { encoding: 'utf8' });
      diff = outputFallback.toString();
    } catch (fallbackError) {
      console.error('Error getting fallback git diff:', fallbackError);
      fs.writeFileSync('pr_review_output.txt', 'Error: Could not retrieve git diff.');
      return;
    }
  }

  if (!diff || diff.trim() === '') {
    console.info('No diff found to review.');
    fs.writeFileSync('pr_review_output.txt', 'No significant changes to review.');
    return;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Review the following pull request git diff. Provide a summary of the changes, identify any potential bugs or security issues, and suggest improvements. \n\nDiff:\n${diff.substring(0, 50000)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const review = response.text || 'Review could not be generated.';
    fs.writeFileSync('pr_review_output.txt', review);
    console.info('PR Review generated and saved to pr_review_output.txt');
  } catch (error) {
    console.error('Error querying Gemini for PR review:', error);
    fs.writeFileSync('pr_review_output.txt', 'Error generating AI review.');
  }
}

reviewPR();
