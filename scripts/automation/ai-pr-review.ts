import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function prReview() {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is missing. Skipping AI PR Review.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH is not set.');
    process.exit(1);
  }

  let prDiff = '';
  try {
    prDiff = fs.readFileSync('pr-diff.txt', 'utf-8');
  } catch (err) {
    console.error('Could not read pr-diff.txt. Diff might be missing.', err);
    process.exit(0); // Exit gracefully so workflow doesn't fail
  }

  try {
    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf-8')) as Record<string, any>;
    const prTitle = eventData.pull_request?.title || 'Unknown PR';
    const prBody = eventData.pull_request?.body || 'No description provided.';
    const prNumber = eventData.pull_request?.number;

    if (!prNumber) {
      console.warn('No pull request number found in event payload.');
      process.exit(0);
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `You are a senior staff engineer performing a code review.
Review the following Pull Request for the Intelli-Credit-V2 repository.
Please identify any code quality issues, security concerns, performance regressions, or architectural flaws.
Provide actionable feedback, suggest improvements, and commend good practices. Be concise but thorough.

PR Title: ${prTitle}
PR Description: ${prBody}

Diff:
\`\`\`diff
${prDiff}
\`\`\`
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const reply = response.text || 'Review completed but no feedback was generated.';

    fs.writeFileSync('pr-comment.txt', reply, 'utf-8');
    console.info('PR review comment successfully written to pr-comment.txt');
  } catch (err) {
    console.error('Error during AI PR review:', err);
    process.exit(1);
  }
}

void prReview();
