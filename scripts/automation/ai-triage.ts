import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function triage(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('No GEMINI_API_KEY provided. Skipping triage.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !fs.existsSync(eventPath)) {
    console.info('No GITHUB_EVENT_PATH found. Skipping triage.');
    process.exit(0);
  }

  const event = JSON.parse(fs.readFileSync(eventPath, 'utf-8')) as Record<string, any>;
  if (!event.issue) {
    console.info('Not an issue event. Skipping triage.');
    process.exit(0);
  }

  const issueTitle = event.issue.title || '';
  const issueBody = event.issue.body || '';

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are a senior open-source maintainer triaging a new issue.
Provide a welcoming, helpful, and concise response to the user.
If it looks like a bug, suggest potential areas in the codebase to check.
If it looks like a feature request, discuss its viability.
If it's a question, try to answer it.

Issue Title: ${issueTitle}
Issue Body: ${issueBody}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    const text = response.text;
    if (text) {
      fs.writeFileSync('triage-comment.txt', text);
      console.info('Triage comment generated successfully.');
    }
  } catch (error) {
    console.error('Failed to generate triage comment:', error);
    process.exit(0);
  }
}

triage().catch(console.error);
