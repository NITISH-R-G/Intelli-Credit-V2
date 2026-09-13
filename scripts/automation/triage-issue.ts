import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function triage() {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not set. Skipping triage.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const eventPath = process.env.GITHUB_EVENT_PATH;

  if (!eventPath || !fs.existsSync(eventPath)) {
    console.error('GITHUB_EVENT_PATH is missing or invalid.');
    process.exit(0);
  }

  const eventPayload = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));
  const issue = eventPayload.issue;

  if (!issue) {
    console.warn('Not an issue event. Skipping.');
    process.exit(0);
  }

  const title = issue.title;
  const body = issue.body || '';

  const prompt = `
  You are an AI maintainer for an open-source project.
  A new issue has been created or edited.

  Title: ${title}
  Body:
  ${body}

  Please analyze this issue and provide a polite, helpful response for the user.
  Include steps they can take, questions to clarify the issue if it's a bug, or an acknowledgement if it's a feature request.
  Do not use markdown block formatting for the whole response, just write the comment text naturally.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const comment = response.text || 'Thanks for submitting this issue! We will review it shortly.';
    fs.writeFileSync('triage-comment.txt', comment);
    console.info('Triage comment generated successfully.');
  } catch (error) {
    console.error('Error during AI triage:', error);
  }
}

triage().catch(console.error);
