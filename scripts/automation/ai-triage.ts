import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set. Exiting gracefully.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });
const eventPath = process.env.GITHUB_EVENT_PATH;

async function runTriage(): Promise<void> {
  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH not set.');
    process.exit(1);
  }

  try {
    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
    const issue = eventData.issue;
    if (!issue) {
      console.error('No issue data found in event payload.');
      process.exit(0);
    }

    const title = issue.title;
    const body = issue.body || '';
    const prompt = `Analyze this GitHub issue for triage. Provide a brief summary, suggest labels, and give a polite, helpful response for the user.\n\nTitle: ${title}\n\nBody:\n${body}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const output = response.text || 'Thank you for your submission. We will look into it.';
    fs.writeFileSync('triage-comment.txt', output);
    console.info('Triage completed successfully.');
  } catch (e) {
    console.error('Error during triage:', e);
    process.exit(1);
  }
}

void runTriage();
