import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';

async function reviewPR(): Promise<void> {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not found. Skipping PR review.');
    process.exit(0);
  }

  const diffPath = process.env.PR_DIFF_PATH || 'pr-diff.txt';
  if (!fs.existsSync(diffPath)) {
    console.warn(`Diff file ${diffPath} not found. Skipping review.`);
    process.exit(0);
  }

  const diff = fs.readFileSync(diffPath, 'utf8');
  if (!diff.trim()) {
    console.info('Empty diff, nothing to review.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `
  You are an expert AI repository maintainer reviewing a Pull Request.
  Review the following git diff and provide constructive feedback, point out potential bugs, security issues, or code quality improvements.
  Keep it concise, actionable, and formatted in Markdown.

  Git Diff:
  \`\`\`diff
  ${diff}
  \`\`\`
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    let text = response.text || '';
    text = `🤖 **AI Maintainer PR Review**\n\n${text}`;

    fs.writeFileSync('pr-comment.txt', text);
    console.info('PR review comment generated and saved to pr-comment.txt.');
  } catch (error: unknown) {
    console.error('Error generating PR review:', error);
    process.exit(1);
  }
}

void reviewPR();
