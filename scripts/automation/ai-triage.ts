import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function triage() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Exiting triage.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH is not set.');
    process.exit(1);
  }

  const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));
  const issue = eventData.issue;
  if (!issue) {
    console.error('No issue data found in event.');
    process.exit(1);
  }

  const prompt = `
  You are an AI maintainer for the Intelli-Credit project.
  Analyze the following issue and provide a welcoming response, suggest labels, and give initial advice or steps for resolution.

  Issue Title: ${issue.title}
  Issue Body: ${issue.body}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    fs.writeFileSync('triage-comment.txt', response.text || '');
    console.info('Triage comment generated successfully.');
  } catch (error) {
    console.error('Error calling Gemini API for triage', error);
    process.exit(1);
  }
}

void triage();
