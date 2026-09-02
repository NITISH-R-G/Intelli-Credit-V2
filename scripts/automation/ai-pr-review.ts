import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import { execFileSync } from 'node:child_process';

async function reviewPR(): Promise<void> {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.warn('No GITHUB_EVENT_PATH found. Skipping PR review.');
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('No GEMINI_API_KEY found. Exiting gracefully.');
    process.exit(0);
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn('No GITHUB_TOKEN found. Exiting.');
    process.exit(0);
  }

  const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8')) as {
    pull_request?: { url: string; title: string; body: string };
  };

  const pr = eventData.pull_request;
  if (!pr) {
    console.warn('No pull_request data found in event payload.');
    return;
  }

  let diff = '';
  try {
    const diffBuffer = execFileSync('curl', [
      '-s',
      '-H',
      `Authorization: Bearer ${token}`,
      '-H',
      'Accept: application/vnd.github.v3.diff',
      pr.url,
    ]);
    diff = (diffBuffer as unknown as Buffer).toString('utf-8');
  } catch (err) {
    console.error('Failed to fetch PR diff', err);
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert AI maintainer reviewing a Pull Request.
Title: ${pr.title}
Description: ${pr.body}

Diff:
${diff}

Please provide a thorough code review. Identify potential bugs, security issues, and stylistic improvements.
Output your review in Markdown.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const reply = response.text;
    if (reply) {
      fs.writeFileSync('pr-comment.txt', reply);
      console.info('PR review comment written to pr-comment.txt');
    }
  } catch (err) {
    console.error('Error running AI PR review:', err);
    process.exit(1);
  }
}


void reviewPR();
