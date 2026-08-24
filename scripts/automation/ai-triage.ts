import * as fs from 'node:fs';
import * as path from 'node:path';
import { GoogleGenAI } from '@google/genai';

async function triage(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Exiting gracefully.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH is not set.');
    process.exit(1);
  }

  try {
    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf-8')) as {
      issue?: {
        title: string;
        body: string;
        number: number;
        user?: { login: string };
      };
    };

    const issue = eventData.issue;
    if (!issue) {
      console.error('No issue data found in event payload.');
      process.exit(1);
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are an expert AI open-source maintainer for this repository.
An issue has been opened. Please analyze it, provide a warm welcome,
triage the problem, suggest initial steps or solutions, and ask clarifying questions if needed.

Issue Title: ${issue.title}
Issue Body: ${issue.body || 'No description provided.'}
Opened by: ${issue.user?.login || 'Contributor'}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const responseText =
      response.text || 'Thank you for your issue. A maintainer will review it shortly.';

    fs.writeFileSync('triage-comment.txt', responseText);
    console.info('Triage comment generated successfully.');
  } catch (error) {
    console.error('Error during triage:', error);
    process.exit(1);
  }
}

void triage();
