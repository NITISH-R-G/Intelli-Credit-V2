import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';

async function triage(): Promise<void> {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not set. Skipping issue triage.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const eventPath = process.env.GITHUB_EVENT_PATH;

  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH is not set.');
    process.exit(1);
  }

  try {
    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
    const issue = eventData.issue;

    if (!issue) {
      console.warn('No issue found in event data.');
      process.exit(0);
    }

    const title = issue.title || '';
    const body = issue.body || '';

    const prompt = `
      You are an AI maintainer for the Intelli-Credit Terminal project.
      An issue has been opened. Please analyze the issue and provide a triage response.
      The response should be helpful, categorize the issue, and suggest next steps.

      Issue Title: ${title}
      Issue Body: ${body}

      Format the output as a GitHub comment in Markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const comment = response.text || 'Thank you for your report. We will look into it.';

    fs.writeFileSync('triage-comment.txt', comment);
    console.info('Triage comment written to triage-comment.txt');
  } catch (error) {
    console.error('Error during issue triage:', error);
    process.exit(1);
  }
}

void triage();
