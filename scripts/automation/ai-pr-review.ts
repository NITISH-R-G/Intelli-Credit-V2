import fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function review() {
  if (!process.env.GEMINI_API_KEY) {
    console.info('GEMINI_API_KEY not found. Skipping AI PR Review.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const diffPath = 'pr-diff.txt';

  if (!fs.existsSync(diffPath)) {
    console.error('pr-diff.txt does not exist.');
    process.exit(1);
  }

  try {
    const diff = fs.readFileSync(diffPath, 'utf8');
    if (!diff.trim()) {
      console.info('Empty diff. No review generated.');
      process.exit(0);
    }

    const prompt = `You are a senior maintainer for Intelli-Credit, reviewing a pull request.
Review the following git diff. Identify potential bugs, security concerns, performance regressions, and style violations. Provide actionable feedback.

Git Diff:
${diff}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text || 'No review generated.';
    fs.writeFileSync('pr-comment.txt', report);
    console.info('PR review generated successfully.');
  } catch (err) {
    console.error('Error during AI PR review:', err);
    process.exit(1);
  }
}

void review();
