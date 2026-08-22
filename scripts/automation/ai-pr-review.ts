import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import { execFileSync } from 'child_process';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.info('GEMINI_API_KEY missing, skipping PR review.');
  process.exit(0);
}

const eventPath = process.env.GITHUB_EVENT_PATH;
if (!eventPath) {
  console.info('GITHUB_EVENT_PATH missing.');
  process.exit(0);
}

const eventPayload = JSON.parse(fs.readFileSync(eventPath, 'utf8')) ;
const prUrl = eventPayload.pull_request?.url;
if (!prUrl) {
  console.info('PR URL missing.');
  process.exit(0);
}

async function review(): Promise<void> {
  let diff = '';
  try {
    diff = (
      execFileSync('curl', [
        '-s',
        '-H',
        'Accept: application/vnd.github.v3.diff',
        '-H',
        `Authorization: Bearer ${process.env.GITHUB_TOKEN}`,
        prUrl,
      ]) as unknown as Buffer
    ).toString('utf-8');
  } catch (e) {
    console.error('Error fetching diff', e);
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `Review the following git diff and provide constructive feedback:
${diff}`,
  });

  const comment = response.text || 'Looks good!';
  fs.writeFileSync('pr-comment.txt', comment);
}

void review();
