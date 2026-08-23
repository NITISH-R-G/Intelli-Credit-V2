import fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function triage(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('No GEMINI_API_KEY found, skipping AI Triage.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !fs.existsSync(eventPath)) {
    console.error('No GITHUB_EVENT_PATH found.');
    process.exit(1);
  }

  const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const issue = event.issue;

  if (!issue) {
    console.error('No issue data found in event.');
    process.exit(1);
  }

  const prompt = `
Please triage the following GitHub issue.
Title: ${issue.title}
Body: ${issue.body}

Provide a short, professional response that:
1. Acknowledges the issue.
2. Identifies potential next steps or labels to apply.
3. If it is a bug, asks for reproduction steps if missing.
`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    const text = response.text || 'Thank you for submitting this issue. Our team will review it shortly.';
    fs.writeFileSync('triage-comment.txt', text);
    console.info('Triage comment generated successfully.');
  } catch (error) {
    console.error('Error during AI Triage:', error);
    process.exit(1);
  }
}

void triage();
