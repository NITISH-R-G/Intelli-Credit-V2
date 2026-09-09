import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function triage(): Promise<void> {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.warn('GITHUB_EVENT_PATH not set, skipping triage');
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set, skipping triage');
    process.exit(0);
  }

  let eventPayload: any;
  try {
    const eventContent = fs.readFileSync(eventPath, 'utf-8');
    eventPayload = JSON.parse(eventContent);
  } catch (error) {
    console.error('Failed to read or parse event payload', error);
    process.exit(1);
  }

  const issue = eventPayload.issue;
  if (!issue) {
    console.warn('No issue found in event payload');
    return;
  }

  const title = issue.title;
  const body = issue.body || '';

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are an expert AI maintainer for an open-source project.
A new issue has been created. Analyze the issue and provide a helpful, welcoming, and technical initial response.
If there are obvious solutions, suggest them. If more information is needed, politely ask for it.

Issue Title: ${title}
Issue Body:
${body}

Provide your response in Markdown format.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const comment = response.text || 'Thank you for your issue! We will look into it shortly.';
    fs.writeFileSync('triage-comment.txt', comment, 'utf-8');
    console.info('Successfully generated triage comment');
  } catch (error) {
    console.error('Failed to generate triage comment', error);
    process.exit(1);
  }
}

void triage();
