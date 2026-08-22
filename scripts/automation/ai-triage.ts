import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.info('GEMINI_API_KEY missing, skipping triage.');
  process.exit(0);
}

const eventPath = process.env.GITHUB_EVENT_PATH;
if (!eventPath) {
  console.info('GITHUB_EVENT_PATH missing.');
  process.exit(0);
}

const eventPayload = JSON.parse(fs.readFileSync(eventPath, 'utf8')) ;
const issueBody = eventPayload.issue?.body || '';
const issueTitle = eventPayload.issue?.title || '';

async function triage(): Promise<void> {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `Please triage the following issue and provide a suggested response.
Title: ${issueTitle}
Body: ${issueBody}`,
  });

  const comment = response.text || 'Thank you for your issue. We are reviewing it.';
  fs.writeFileSync('triage-comment.txt', comment);
}

void triage();
