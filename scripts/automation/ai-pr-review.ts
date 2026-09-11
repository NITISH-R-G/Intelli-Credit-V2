import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY not found. Skipping AI PR review.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

async function reviewPR() {
  try {
    let diff = '';
    if (fs.existsSync('pr-diff.txt')) {
      diff = fs.readFileSync('pr-diff.txt', 'utf-8');
    } else {
      console.info('No pr-diff.txt found. Trying git diff...');
      try {
        // Not ideal for Actions, but as fallback
        diff = (
          execFileSync('git', ['diff', 'origin/main...HEAD']) as unknown as Buffer
        ).toString();
      } catch (e) {
        console.error('Failed to get git diff', e);
      }
    }

    if (!diff || diff.trim() === '') {
      console.info('No diff found to review.');
      return;
    }

    console.info('Calling Gemini API for PR review...');
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `You are an expert code reviewer. Review the following pull request diff. Look for security vulnerabilities, performance issues, logic bugs, and style violations. Be constructive.\n\nDiff:\n${diff}`,
    });

    const review = response.text || 'LGTM!';
    fs.writeFileSync('pr-comment.txt', review);
    console.info('PR review written to pr-comment.txt');
  } catch (err) {
    console.error('Error during PR review:', err);
  }
}

void reviewPR();
