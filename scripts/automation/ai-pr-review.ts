import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

async function reviewPR(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Skipping PR review.');
    process.exit(0);
  }

  const diffPath = 'pr-diff.txt';
  if (!fs.existsSync(diffPath)) {
    console.warn('pr-diff.txt not found. Cannot review PR.');
    process.exit(0);
  }

  const prDiff = fs.readFileSync(diffPath, 'utf-8');

  if (!prDiff.trim()) {
     console.warn('pr-diff.txt is empty. Cannot review PR.');
     process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  let prContext = '';
  if (eventPath && fs.existsSync(eventPath)) {
      const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));
      if (eventData.pull_request) {
          prContext = `PR Title: ${eventData.pull_request.title}\nPR Body: ${eventData.pull_request.body}`;
      }
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are a senior staff engineer reviewing a pull request.
Here is the context of the PR:
${prContext}

Here is the diff:
\`\`\`diff
${prDiff.substring(0, 80000)} // Truncating if too long
\`\`\`

Please review the code changes. Provide constructive feedback, point out any bugs, security vulnerabilities, or performance issues.
Be helpful, concise, and encourage best practices.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const commentBody = response.text || "LGTM! I have no further feedback.";
    fs.writeFileSync('pr-comment.txt', commentBody);
    console.info('PR comment written to pr-comment.txt');
  } catch (error) {
    console.error('Failed to generate PR review:', error);
    process.exit(1);
  }
}

void reviewPR();
