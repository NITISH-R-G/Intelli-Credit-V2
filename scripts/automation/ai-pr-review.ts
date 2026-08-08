import { GoogleGenAI } from '@google/genai';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('No GEMINI_API_KEY found, exiting gracefully.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

async function review() {
  try {
    let diff = '';
    if (fs.existsSync('pr-diff.txt')) {
      diff = fs.readFileSync('pr-diff.txt', 'utf-8');
    } else {
      // fallback for local testing
      diff = (execFileSync('git', ['diff', 'HEAD~1...HEAD']) as unknown as Buffer).toString();
    }

    if (!diff || diff.trim() === '') {
      console.info('No diff found.');
      process.exit(0);
    }

    // Prevent exceeding token limit for massive PRs
    if (diff.length / 4 > 800000) {
      diff = diff.substring(0, 800000 * 4) + '\n\n... (Diff truncated due to size limits)';
    }

    const prompt = `
        You are a highly capable AI staff engineer reviewing a pull request for the Intelli-Credit Terminal repository.
        Please review the following git diff.
        Focus on:
        1. Code quality and maintainability.
        2. Security vulnerabilities.
        3. Performance regressions.
        4. Readability and conventions.

        Provide constructive, professional feedback. If the code looks good, express approval.

        Git Diff:
        ${diff}
        `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const feedback = response.text || 'LGTM! No issues found.';

    fs.writeFileSync('pr-comment.txt', feedback, 'utf-8');
    console.info('Successfully generated PR review comment.');
  } catch (e) {
    console.error('Error during PR review:', e);
    process.exit(1);
  }
}

void review();
