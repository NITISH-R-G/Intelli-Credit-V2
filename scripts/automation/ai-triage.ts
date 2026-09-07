import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function triage(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is missing. Skipping AI triage.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const eventPath = process.env.GITHUB_EVENT_PATH;
    if (!eventPath) {
      console.warn('GITHUB_EVENT_PATH is not set.');
      return;
    }

    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));
    const issue = eventData.issue;

    if (!issue) {
      console.warn('No issue found in event payload.');
      return;
    }

    const prompt = `
Analyze the following GitHub issue and provide a friendly triage response:
Title: ${issue.title}
Body: ${issue.body}

The response should:
1. Be welcoming and thank the author for the issue.
2. Identify potential labels (e.g., bug, enhancement, documentation).
3. Offer initial thoughts or next steps.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const comment =
      response.text || 'Thank you for your issue! A maintainer will look into it shortly.';
    fs.writeFileSync('triage-comment.txt', comment);
    console.info('Triage comment generated successfully.');
  } catch (error) {
    console.error('Error during AI triage:', error);
    process.exit(1);
  }
}

void triage();
