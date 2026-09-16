import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY is not set. Skipping AI Issue Triage.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

async function triage() {
  try {
    const eventPath = process.env.GITHUB_EVENT_PATH;
    if (!eventPath) {
      console.warn('GITHUB_EVENT_PATH is not set. Skipping AI Issue Triage.');
      process.exit(0);
    }

    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8')) as {
      issue?: {
        title: string;
        body: string;
        number: number;
      };
    };

    if (!eventData.issue) {
      console.warn('No issue data found in event payload. Skipping.');
      process.exit(0);
    }

    const { title, body } = eventData.issue;

    const prompt = `You are a senior open source maintainer triaging a new issue.
Please analyze the following issue and provide a friendly, helpful response to the contributor.
Acknowledge the issue, suggest potential areas in the codebase that might be relevant, and ask for clarification if needed.
Keep the response professional, concise, and actionable.

Issue Title: ${title}
Issue Body: ${body}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const aiResponseText = response.text;

    if (aiResponseText) {
      fs.writeFileSync('triage-comment.txt', aiResponseText);
      console.info('Successfully generated AI triage response.');
    } else {
      console.error('AI response was empty.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error during AI issue triage:', error);
    process.exit(1);
  }
}

void triage();
