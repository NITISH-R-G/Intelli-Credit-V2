import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function triage(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is missing. Exiting gracefully.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !fs.existsSync(eventPath)) {
    console.error('GITHUB_EVENT_PATH is not defined or does not exist.');
    process.exit(0); // Exit without failing CI
  }

  const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const issue = eventData.issue;

  if (!issue) {
    console.error('No issue data found in event payload.');
    process.exit(0);
  }

  const title = issue.title || '';
  const body = issue.body || '';

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
    You are an AI maintainer. A new issue has been opened:
    Title: ${title}
    Body: ${body}

    Please provide an intelligent triage response. Assess if it's a bug, feature request, or question. Suggest potential root causes or next steps. Be polite and helpful. Do not output anything other than the response text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const replyText = response.text || 'Thank you for your issue! We will look into it.';
    fs.writeFileSync('triage-comment.txt', replyText);
    console.info('Triage response written to triage-comment.txt');
  } catch (err) {
    console.error('Failed to generate response:', err);
    process.exit(1);
  }
}

void triage();
