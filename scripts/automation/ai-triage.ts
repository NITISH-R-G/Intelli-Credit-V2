import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY not found. Skipping AI triage.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

async function triage(): Promise<void> {
  try {
    const eventPath = process.env.GITHUB_EVENT_PATH;
    if (!eventPath) {
      console.info('Not running in a GitHub Action environment or event path missing.');
      return;
    }

    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));

    if (!eventData.issue) {
      console.info('No issue data found in event.');
      return;
    }

    const issueTitle = eventData.issue.title || '';
    const issueBody = eventData.issue.body || '';

    console.info(`Triaging issue: ${issueTitle}`);

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `You are an AI maintainer. Triage the following issue and provide helpful feedback, classify it, and suggest a resolution path.\n\nTitle: ${issueTitle}\n\nBody: ${issueBody}`,
    });

    const reply =
      response.text || 'Thank you for submitting this issue. We will look into it soon.';

    fs.writeFileSync('triage-comment.txt', reply);
    console.info('Triage comment written to triage-comment.txt');
  } catch (err) {
    console.error('Error during triage:', err);
  }
}

void triage();
