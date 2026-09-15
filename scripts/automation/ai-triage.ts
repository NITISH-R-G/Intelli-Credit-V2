import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('GEMINI_API_KEY not found. Skipping AI Triage.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

async function triage() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.warn('GITHUB_EVENT_PATH not set.');
    return;
  }

  let event;
  try {
    event = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));
  } catch (e) {
    console.error('Error parsing event payload');
    return;
  }

  if (!event.issue) {
    console.warn('No issue found in event payload.');
    return;
  }

  const title = event.issue.title || '';
  const body = event.issue.body || '';

  const prompt = `
    You are an expert open-source maintainer triaging an issue.

    Issue Title: ${title}
    Issue Body: ${body}

    Provide a helpful, welcoming, and technical response to the issue creator.
    Acknowledge the issue, suggest potential areas in the codebase that might be relevant, and ask for any missing context if necessary.
    Be concise but professional.
    `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    fs.writeFileSync(
      'triage-comment.txt',
      response.text || 'Thanks for opening this issue! We will look into it.',
    );
    console.info('Triage complete. Comment saved to triage-comment.txt');
  } catch (e) {
    console.error('Error during AI triage', e);
  }
}

void triage();
