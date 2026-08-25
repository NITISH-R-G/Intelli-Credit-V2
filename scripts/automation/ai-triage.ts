import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.info('Skipping AI triage: GEMINI_API_KEY is not set.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

async function triage() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH not set.');
    process.exit(1);
  }

  const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const issue = eventData.issue;

  if (!issue) {
    console.error('No issue data found in event payload.');
    process.exit(1);
  }

  const title = issue.title || '';
  const body = issue.body || '';

  const prompt = `
You are an AI maintainer for an open-source project. An issue has been created:
Title: ${title}
Body: ${body}

Provide a polite triage response to the user. Ask clarifying questions if the issue is vague. If it's a bug report, suggest troubleshooting steps. If it's a feature request, discuss the feasibility briefly. Format the response in Markdown. Do not introduce yourself.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const comment =
      response.text || 'Thank you for your issue. A maintainer will review it shortly.';
    fs.writeFileSync('triage-comment.txt', comment, 'utf8');
    console.info('Triage comment generated successfully.');
  } catch (error) {
    console.error('Error generating triage comment:', error);
    process.exit(1);
  }
}

void triage();
