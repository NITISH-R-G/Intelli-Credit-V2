import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function reviewPR(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('GEMINI_API_KEY not found. Skipping PR review.');
    process.exit(0);
  }

  let prDiff: string;
  try {
    prDiff = fs.readFileSync('pr-diff.txt', 'utf-8');
  } catch {
    console.warn('pr-diff.txt not found. Cannot perform PR review.');
    process.exit(0);
  }

  if (!prDiff.trim()) {
    console.info('PR diff is empty. Skipping review.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are a senior staff engineer reviewing a pull request.
Review the following git diff. Identify potential bugs, security vulnerabilities, performance regressions,
or code smells. Provide constructive feedback and recommend fixes where applicable.

Git Diff:
\`\`\`diff
${prDiff}
\`\`\``;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt
    });

    const comment = response.text;
    if (comment) {
      fs.writeFileSync('pr-comment.txt', comment);
      console.info('Successfully generated PR review comment to pr-comment.txt');
    } else {
        console.warn('AI generated an empty response.');
    }
  } catch {
    console.error('Error generating content with Gemini');
    process.exit(1);
  }
}

void reviewPR();
