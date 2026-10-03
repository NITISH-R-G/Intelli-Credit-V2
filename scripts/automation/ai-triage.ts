import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function triage(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Skipping AI triage.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH not found.');
    process.exit(1);
  }

  try {
    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf-8')) as Record<string, unknown>;
    const issue = eventData.issue as Record<string, unknown>;
    if (!issue) {
      console.warn('No issue data found in event payload.');
      process.exit(0);
    }

    const title = issue.title as string;
    const body = issue.body as string;

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a senior staff software engineer triaging an issue.
Review the following issue and provide a short, helpful triage response including potential next steps or questions for clarification.
Title: ${title}
Body: ${body}

Response format: Markdown`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const triageComment = response.text;
    if (triageComment) {
      fs.writeFileSync('triage-comment.txt', triageComment, 'utf-8');
      console.info('Triage comment generated successfully.');
    } else {
        console.warn('AI generated an empty response.');
    }
  } catch (error: unknown) {
    console.error('Error during AI triage:', error);
    process.exit(1);
  }
}

void triage();
