import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';

async function triage(): Promise<void> {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.warn('No GITHUB_EVENT_PATH found. Skipping triage.');
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('No GEMINI_API_KEY found. Exiting gracefully.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });

  const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8')) as {
    issue?: { title: string; body: string };
  };

  const issue = eventData.issue;
  if (!issue) {
    console.warn('No issue data found in event payload.');
    return;
  }

  const prompt = `
You are an expert AI maintainer for the Intelli-Credit open source project.
Analyze the following issue and provide helpful triage feedback, categorization, and next steps.

Title: ${issue.title}
Description: ${issue.body}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const reply = response.text;
    if (reply) {
      fs.writeFileSync('triage-comment.txt', reply);
      console.info('Triage comment written to triage-comment.txt');
    }
  } catch (err) {
    console.error('Error running AI triage:', err);
    process.exit(1);
  }
}


void triage();
