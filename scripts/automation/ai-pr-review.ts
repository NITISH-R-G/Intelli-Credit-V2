import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';

async function reviewPR() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Exiting gracefully.');
    process.exit(0);
  }

  const diffPath = process.env.PR_DIFF_PATH;
  if (!diffPath || !fs.existsSync(diffPath)) {
    console.error('PR_DIFF_PATH is not set or file does not exist.');
    process.exit(1);
  }

  const diff = fs.readFileSync(diffPath, 'utf8');
  if (!diff.trim()) {
    console.warn('Empty diff. Nothing to review.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert AI repository maintainer.
Please review the following git diff for a Pull Request.

Provide a constructive, professional code review.
Focus on:
1. Potential bugs or edge cases.
2. Code quality and maintainability.
3. Security concerns.
4. Performance implications.

If the diff looks good, provide a brief approval message.
Otherwise, format your response in markdown, clearly highlighting areas for improvement.

Diff:
\`\`\`diff
${diff}
\`\`\`
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const comment = response.text || 'Review completed. Everything looks good!';
    fs.writeFileSync('pr-review-comment.txt', comment, 'utf-8');
    console.info('Successfully generated PR review comment.');
  } catch (error) {
    console.error('Failed to generate PR review comment via Gemini:', error);
    process.exit(1);
  }
}

void reviewPR();
