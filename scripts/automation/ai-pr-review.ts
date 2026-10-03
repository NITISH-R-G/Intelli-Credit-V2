import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function reviewPR(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Skipping AI PR review.');
    process.exit(0);
  }

  try {
    let diff = '';
    if (fs.existsSync('pr-diff.txt')) {
      diff = fs.readFileSync('pr-diff.txt', 'utf-8');
    } else {
      console.warn('pr-diff.txt not found. Exiting.');
      process.exit(0);
    }

    if (!diff.trim()) {
      console.warn('Empty PR diff. Exiting.');
      process.exit(0);
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a senior staff software engineer reviewing a pull request.
Review the following git diff and provide constructive feedback on code quality, potential bugs, security issues, and alignment with best practices.
Provide specific, actionable suggestions.
If the diff looks perfect, just reply with a short approval message.

Diff:
\`\`\`diff
${diff}
\`\`\`

Response format: Markdown`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const prComment = response.text;
    if (prComment) {
      fs.writeFileSync('pr-comment.txt', prComment, 'utf-8');
      console.info('PR review comment generated successfully.');
    } else {
        console.warn('AI generated an empty response.');
    }
  } catch (error: unknown) {
    console.error('Error during AI PR review:', error);
    process.exit(1);
  }
}

void reviewPR();
