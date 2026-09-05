import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function triage(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Skipping triage.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH not found.');
    process.exit(1);
  }

  const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8')) as {
    issue?: { title: string; body: string };
  };

  const issue = eventData.issue;
  if (!issue) {
    console.info('No issue data found in event payload.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are an AI maintainer reviewing an issue. Review the following issue and provide a brief, helpful response, categorize the request, and recommend any immediate actions.

Title: ${issue.title}
Body: ${issue.body}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    fs.writeFileSync('triage-comment.txt', response.text ?? 'No response generated.');
    console.info('Triage comment generated successfully.');
  } catch (error) {
    console.error('Failed to generate triage comment:', error);
    process.exit(1);
  }
}

void triage();
