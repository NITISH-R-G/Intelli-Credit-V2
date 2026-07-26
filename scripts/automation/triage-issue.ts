import fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function triage(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('GEMINI_API_KEY not found. Skipping issue triage to allow external PRs/forks to pass.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH not set.');
    process.exit(1);
  }

  let eventData: any;
  try {
    const rawData = fs.readFileSync(eventPath, 'utf8');
    eventData = JSON.parse(rawData);
  } catch (error) {
    console.error('Error reading event payload:', error);
    process.exit(1);
  }

  const issue = eventData.issue;
  if (!issue) {
    console.info('No issue data found in event payload.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are an expert AI Maintainer for this open-source project.
Please triage the following issue:
Title: ${issue.title}
Body: ${issue.body}

Provide a helpful, polite response that categorizes the issue, suggests potential next steps, and asks for clarifying information if needed.`;

  try {
    console.info('Generating triage response via Gemini...');
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    if (response.text) {
      fs.writeFileSync('triage-comment.txt', response.text, 'utf8');
      console.info('Triage comment written to triage-comment.txt.');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    process.exit(1);
  }
}

void triage();
