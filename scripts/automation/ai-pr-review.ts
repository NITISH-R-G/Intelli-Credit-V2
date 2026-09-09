import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function prReview(): Promise<void> {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.warn('GITHUB_EVENT_PATH not set, skipping PR review');
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set, skipping PR review');
    process.exit(0);
  }

  let eventPayload: any;
  try {
    const eventContent = fs.readFileSync(eventPath, 'utf-8');
    eventPayload = JSON.parse(eventContent);
  } catch (error) {
    console.error('Failed to read or parse event payload', error);
    process.exit(1);
  }

  const pr = eventPayload.pull_request;
  if (!pr) {
    console.warn('No pull_request found in event payload');
    return;
  }

  let diff = '';
  try {
    if (fs.existsSync('pr-diff.txt')) {
      diff = fs.readFileSync('pr-diff.txt', 'utf-8');
    } else {
      console.warn('pr-diff.txt not found. Cannot perform thorough review.');
    }
  } catch (error) {
    console.error('Failed to read pr-diff.txt', error);
  }

  const title = pr.title;
  const body = pr.body || '';

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are an expert AI code reviewer for an open-source project.
Please review the following Pull Request.
Look for bugs, security issues, performance problems, and adherence to best practices.
Provide a constructive, professional, and helpful review in Markdown format.

PR Title: ${title}
PR Body:
${body}

PR Diff:
\`\`\`diff
${diff.slice(0, 50000)} // truncate to avoid massive prompts if needed
\`\`\`
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const comment = response.text || 'Review completed. LGTM!';
    fs.writeFileSync('pr-comment.txt', comment, 'utf-8');
    console.info('Successfully generated PR review comment');
  } catch (error) {
    console.error('Failed to generate PR review comment', error);
    process.exit(1);
  }
}

void prReview();
