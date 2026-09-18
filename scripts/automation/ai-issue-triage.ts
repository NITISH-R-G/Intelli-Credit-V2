

import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';

async function triage(): Promise<void> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. Exiting ai-issue-triage gracefully.');
      process.exit(0);
    }

    const eventPath = process.env.GITHUB_EVENT_PATH;
    if (!eventPath) {
      console.warn('GITHUB_EVENT_PATH is not set. Exiting.');
      return;
    }

    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
    const issue = eventData.issue;

    if (!issue) {
      console.warn('No issue found in event data.');
      return;
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are a senior staff engineer maintaining this repository.
An issue has been opened:
Title: ${issue.title}
Body: ${issue.body}

Please provide a helpful, constructive, and guiding response to the issue creator.
Help triage it. If it's a bug, ask for repro steps if not provided. If it's a feature, discuss its viability.
Limit your response to a concise, professional comment.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text;
    if (text) {
      fs.writeFileSync('triage-comment.txt', text, 'utf8');
      console.info('Successfully generated triage comment.');
    }
  } catch (error) {
    console.error('Error during AI issue triage:', error);
  }
}

triage().catch((err) => {
  console.error('Unhandled error in triage:', err);
  process.exit(1);
});
