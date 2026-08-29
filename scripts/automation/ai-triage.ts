import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY is not set. Exiting gracefully.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

async function triage(): Promise<void> {
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

  const issue = event.issue;
  if (!issue) {
    console.warn('No issue found in event payload.');
    process.exit(0);
  }

  const title = issue.title;
  const body = issue.body || '';

  const prompt = `
Please triage this GitHub issue.
Title: ${title}
Body: ${body}

Provide a suggested response and relevant labels. Format the output clearly.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const comment = response.text || 'Thank you for your issue. We will look into it.';
    fs.writeFileSync('triage-comment.txt', comment);
    console.info('Triage comment written to triage-comment.txt');
  } catch (error) {
    console.error('Error generating content from Gemini:', error);
    process.exit(1);
  }
}

void triage();
