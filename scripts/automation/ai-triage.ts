import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function triage(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('GEMINI_API_KEY not found. Skipping triage.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH not found.');
    process.exit(1);
  }

  let eventPayload: any;
  try {
    const eventData = fs.readFileSync(eventPath, 'utf-8');
    eventPayload = JSON.parse(eventData);
  } catch (error) {
    console.error('Failed to read or parse GITHUB_EVENT_PATH:', error);
    process.exit(1);
  }

  const issue = eventPayload.issue;
  if (!issue) {
    console.info('No issue found in event payload. Skipping triage.');
    process.exit(0);
  }

  const title = issue.title;
  const body = issue.body || '';

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Please triage the following GitHub issue. Provide a helpful response, categorize it (e.g., bug, feature request, question), and suggest some potential next steps or relevant files to look at based on typical React/Express architectures.

Issue Title: ${title}
Issue Body: ${body}`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt
    });

    const comment = response.text;
    if (comment) {
      fs.writeFileSync('triage-comment.txt', comment);
      console.info('Successfully generated triage comment to triage-comment.txt');
    } else {
        console.warn('AI generated an empty response.');
    }

  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    process.exit(1);
  }
}

void triage();
