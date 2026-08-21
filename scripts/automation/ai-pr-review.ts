import * as fs from 'fs';
import * as path from 'path';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('GEMINI_API_KEY is missing. Skipping AI PR review to allow external fork PRs.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

async function reviewPR() {
  try {
    if (!fs.existsSync('pr-diff.txt')) {
      console.error('pr-diff.txt not found. Cannot review PR.');
      process.exit(0);
    }

    const diffContent = fs.readFileSync('pr-diff.txt', 'utf-8');

    if (!diffContent.trim()) {
      console.error('pr-diff.txt is empty.');
      process.exit(0);
    }

    const prompt = `
You are an expert AI code reviewer for a TypeScript React repository.
Review the following Git diff for a Pull Request.

Provide:
1. A summary of the changes.
2. Any potential bugs, security issues, or performance concerns.
3. Suggestions for code improvements, best practices, and readability.
4. A friendly sign-off.

Format your response in Markdown. Do not include introductory text like "Here is the review". Just output the Markdown.

Git Diff:
\`\`\`diff
${diffContent}
\`\`\`
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const responseText = response.text || 'Review complete. No major issues found.';

    fs.writeFileSync('pr-comment.txt', responseText, 'utf-8');
    console.info('Successfully generated PR review comment to pr-comment.txt');
  } catch (error) {
    console.error('Error during AI PR review:', error);
    process.exit(0);
  }
}

void reviewPR();
