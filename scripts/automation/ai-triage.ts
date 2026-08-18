import fs from 'node:fs';

import { GoogleGenAI } from '@google/genai';

async function triage(): Promise<void> {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.info('No GITHUB_EVENT_PATH provided, skipping triage.');
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('GEMINI_API_KEY missing, exiting gracefully.');
    process.exit(0);
  }

  const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));
  const issue = eventData.issue;
  if (!issue) {
    console.info('Not an issue event, skipping.');
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Analyze this new issue and provide a short, helpful triage response. Include any potential initial thoughts, label recommendations, or a welcome message.

Title: ${issue.title}
Body: ${issue.body}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    if (response.text) {
      fs.writeFileSync('triage-comment.txt', response.text as string);
      console.info('Triage comment written to triage-comment.txt');
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

void triage();
