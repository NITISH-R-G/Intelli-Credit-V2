import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function triage(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('GEMINI_API_KEY is not set. Exiting ai-triage gracefully.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH is not set.');
    process.exit(1);
  }

  try {
    const eventPayload = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
    const issueTitle = eventPayload.issue?.title || '';
    const issueBody = eventPayload.issue?.body || '';

    if (!issueTitle && !issueBody) {
      console.info('No issue content found.');
      process.exit(0);
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an AI maintainer. Please triage the following issue:
Title: ${issueTitle}
Body: ${issueBody}
Provide a helpful, polite, and actionable response for the contributor.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const aiResponse =
      response.text || 'Thank you for your issue. A maintainer will review it shortly.';

    fs.writeFileSync('triage-comment.txt', aiResponse);
    console.info('Triage comment written to triage-comment.txt');
  } catch (err) {
    console.error('Error during triage:', err);
    process.exit(1);
  }
}

void triage();
