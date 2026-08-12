import fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function triage(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Skipping triage.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.warn('GITHUB_EVENT_PATH is not set.');
    process.exit(0);
  }

  let eventData: any;
  try {
    eventData = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));
  } catch (error) {
    console.error('Failed to parse GITHUB_EVENT_PATH:', error);
    process.exit(1);
  }

  const issue = eventData.issue;
  if (!issue) {
    console.warn('No issue found in event data.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
    You are an AI maintainer for the Intelli-Credit open-source project.
    A new issue has been opened. Review the issue and provide a polite, helpful response.
    If it's a bug, suggest potential areas in the code to investigate.
    If it's a feature, discuss its potential impact and next steps.

    Issue Title: ${issue.title}
    Issue Body: ${issue.body || 'No description provided.'}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const aiResponse = response.text;
    if (aiResponse) {
      fs.writeFileSync('triage-comment.txt', aiResponse);
      console.info('Triage comment generated successfully.');
    }
  } catch (error) {
    console.error('Error generating AI response:', error);
    process.exit(1);
  }
}

void triage();
