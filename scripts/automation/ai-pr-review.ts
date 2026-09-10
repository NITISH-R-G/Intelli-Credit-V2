import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY is missing. Skipping AI PR review.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

async function reviewPR() {
  const diffPath = 'pr-diff.txt';
  if (!fs.existsSync(diffPath)) {
    console.error('pr-diff.txt not found.');
    process.exit(0);
  }

  const diff = fs.readFileSync(diffPath, 'utf8');

  const eventPath = process.env.GITHUB_EVENT_PATH;
  let prDetails = '';
  if (eventPath && fs.existsSync(eventPath)) {
    const eventPayload = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
    if (eventPayload.pull_request) {
      prDetails = `PR Title: ${eventPayload.pull_request.title}\nPR Body: ${eventPayload.pull_request.body || 'None'}\n`;
    }
  }

  const prompt = `
You are an expert AI maintainer reviewing a Pull Request.
${prDetails}
Here is the git diff:
\`\`\`diff
${diff}
\`\`\`

Please provide a concise, helpful review of these changes. Focus on:
1. Bugs or logic errors.
2. Security concerns.
3. Performance issues.
4. Code quality and adherence to best practices.

Provide the review in markdown format suitable for a GitHub comment.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const responseText = response.text;
    if (responseText) {
      fs.writeFileSync('pr-comment.txt', responseText, 'utf8');
      console.info('PR review comment written to pr-comment.txt');
    }
  } catch (error) {
    console.error('Error during AI PR review:', error);
    process.exit(0);
  }
}

void reviewPR();
