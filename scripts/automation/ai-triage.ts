import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function triage(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('GEMINI_API_KEY is not set. Gracefully exiting issue triage.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH is not set.');
    process.exit(1);
  }

  let eventPayload: any;
  try {
    const rawPayload = fs.readFileSync(eventPath, { encoding: 'utf-8' });
    eventPayload = JSON.parse(rawPayload);
  } catch (error) {
    console.error('Failed to read or parse GITHUB_EVENT_PATH:', error);
    process.exit(1);
  }

  const issue = eventPayload.issue;
  if (!issue) {
    console.error('No issue data found in event payload.');
    process.exit(1);
  }

  const title = issue.title;
  const body = issue.body || '';

  const aiClient = new GoogleGenAI({ apiKey });

  const prompt = `You are an AI maintainer. Please triage the following issue:
Title: ${title}
Body: ${body}

Provide a polite acknowledgment to the user, categorize the issue (e.g., Bug, Feature Request, Question), and provide preliminary thoughts or actionable next steps.`;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    if (response.text) {
      fs.writeFileSync('triage-comment.txt', response.text, { encoding: 'utf-8' });
      console.info('Successfully generated triage comment to triage-comment.txt');
    } else {
      console.error('Empty response from GenAI.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Failed to generate content:', error);
    process.exit(1);
  }
}

void triage();
