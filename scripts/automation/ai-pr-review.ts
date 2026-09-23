import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function reviewPR(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('GEMINI_API_KEY is missing. Skipping AI PR review.');
    process.exit(0);
  }

  const eventPath = process.env.PR_EVENT_PATH;
  if (!eventPath) {
    console.error('PR_EVENT_PATH is missing.');
    process.exit(1);
  }

  if (!fs.existsSync('pr-diff.txt')) {
    console.error('pr-diff.txt is missing.');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf-8')) as Record<string, unknown>;
    const pr = eventData.pull_request as Record<string, unknown> | undefined;

    if (!pr) {
      console.error('No pull_request data found in event payload.');
      process.exit(1);
    }

    const title = pr.title as string;
    const body = pr.body as string || 'No description provided.';
    const diff = fs.readFileSync('pr-diff.txt', 'utf-8');

    const prompt = `You are a senior staff engineer and AI reviewer for the Intelli-Credit Terminal repository.
Please review the following Pull Request.

PR Title: ${title}
PR Description:
${body}

Diff:
${diff}

Provide a constructive and comprehensive review of the code changes.
1. Identify any bugs, security vulnerabilities, or performance issues.
2. Check for adherence to best practices (e.g., clear typing, no 'any', proper error handling).
3. Provide actionable suggestions for improvement.
4. Keep the feedback concise and easy to read.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const comment = response.text;
    if (comment) {
      fs.writeFileSync('pr-comment.txt', comment);
      console.info('Successfully generated PR review comment.');
    } else {
      console.warn('AI generated an empty response.');
    }
  } catch (error) {
    console.error('Error during AI PR review:', error);
    process.exit(1);
  }
}

void reviewPR();