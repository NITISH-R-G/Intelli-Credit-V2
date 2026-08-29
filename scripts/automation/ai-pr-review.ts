import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY is not set. Exiting gracefully.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

async function reviewPR(): Promise<void> {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH is not set.');
    process.exit(1);
  }

  let event: any;
  try {
    const eventData = fs.readFileSync(eventPath, 'utf8');
    event = JSON.parse(eventData);
  } catch (error) {
    console.error('Error reading GITHUB_EVENT_PATH:', error);
    process.exit(1);
  }

  const pr = event.pull_request;
  if (!pr) {
    console.warn('No pull_request found in event payload.');
    process.exit(0);
  }

  const prUrl = pr.url;
  const githubToken = process.env.GITHUB_TOKEN;

  if (!githubToken) {
    console.error('GITHUB_TOKEN is not set.');
    process.exit(1);
  }

  let diff: string;
  try {
    diff = (execFileSync('curl', [
      '-s',
      '-H', `Accept: application/vnd.github.v3.diff`,
      '-H', `Authorization: Bearer ${githubToken}`,
      prUrl
    ]) as unknown as Buffer).toString('utf-8');
  } catch (error) {
    console.error('Error fetching PR diff:', error);
    process.exit(1);
  }

  if (!diff) {
     console.warn('Empty PR diff.');
     process.exit(0);
  }

  const prompt = `
Please review this pull request diff.
Diff:
${diff}

Provide constructive feedback, identify potential issues, and suggest improvements.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const comment = response.text || 'Looks good to me.';
    fs.writeFileSync('pr-comment.txt', comment);
    console.info('PR review comment written to pr-comment.txt');
  } catch (error) {
    console.error('Error generating content from Gemini:', error);
    process.exit(1);
  }
}

void reviewPR();
