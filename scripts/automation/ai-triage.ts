import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Exiting gracefully.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH is not set.');
    process.exit(1);
  }

  let eventData;
  try {
    const rawData = fs.readFileSync(eventPath, 'utf8');
    eventData = JSON.parse(rawData);
  } catch (error) {
    console.error('Error reading event payload:', error);
    process.exit(1);
  }

  const issue = eventData.issue;
  if (!issue) {
    console.info('Not an issue event.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Triage the following GitHub issue. Provide a brief analysis, categorize it (bug, feature request, question), and suggest next steps for the user or maintainer.\n\nTitle: ${issue.title}\n\nBody: ${issue.body}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    fs.writeFileSync('triage-comment.txt', response.text || 'No triage generated.');
    console.info('Successfully generated triage comment.');
  } catch (error) {
    console.error('Error generating triage:', error);
    process.exit(1);
  }
}

void main();
