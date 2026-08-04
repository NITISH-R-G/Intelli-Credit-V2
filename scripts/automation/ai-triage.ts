import fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function triage(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('No GEMINI_API_KEY provided. Skipping AI issue triage.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('No GITHUB_EVENT_PATH provided.');
    process.exit(1);
  }

  try {
    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));
    const issue = eventData.issue;

    if (!issue) {
      console.info('Not an issue event. Skipping.');
      process.exit(0);
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a senior open-source maintainer triaging a new issue.
Title: ${issue.title}
Body: ${issue.body}

Please provide a helpful, welcoming triage response. Categorize the issue, mention any missing information, and guide the user on the next steps. Address them professionally.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const responseText = response.text || 'Thank you for opening this issue! A maintainer will review it shortly.';

    fs.writeFileSync('triage-comment.txt', responseText, 'utf-8');
    console.info('Successfully generated AI triage response.');
  } catch (error) {
    console.error('Error during AI triage:', error);
    process.exit(1);
  }
}

void triage();
