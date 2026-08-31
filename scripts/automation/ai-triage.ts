import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function triage(): Promise<void> {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH not set.');
    process.exit(1);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set. Skipping triage.');
    process.exit(0);
  }

  const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const issue = eventData.issue;

  if (!issue) {
    console.info('No issue found in event payload.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert open-source maintainer. Please triage the following issue:
Title: ${issue.title}
Body: ${issue.body}

Provide a helpful, welcoming, and technical response. If more information is needed, ask for it.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const comment = response.text;
    if (comment) {
      fs.writeFileSync('triage-comment.txt', comment);
      console.info('Triage comment generated successfully.');
    } else {
       console.error('No response from Gemini.');
       process.exit(1);
    }
  } catch (error) {
    console.error('Error generating triage comment:', error);
    process.exit(1);
  }
}

void triage();
