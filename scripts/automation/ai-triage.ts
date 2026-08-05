import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';

async function triage() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('GEMINI_API_KEY is not set. Exiting gracefully.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH is not set.');
    process.exit(1);
  }

  let eventPayload;
  try {
    eventPayload = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  } catch (err) {
    console.error('Failed to read GITHUB_EVENT_PATH:', err);
    process.exit(1);
  }

  const issueTitle = eventPayload.issue?.title || '';
  const issueBody = eventPayload.issue?.body || '';

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert AI Maintainer for an open-source project.
Please triage the following issue and provide a helpful, welcoming response.
If there are missing details, kindly ask the user for them.
Categorize the issue (e.g., bug, enhancement, question).

Issue Title: ${issueTitle}
Issue Body: ${issueBody}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const reply = response.text;
    fs.writeFileSync('triage-comment.txt', reply);
    console.info('Triage comment generated successfully.');
  } catch (err) {
    console.error('Failed to generate AI response:', err);
    process.exit(1);
  }
}

void triage();
