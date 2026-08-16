import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

async function triage(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Skipping AI triage to support open source forks.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH not found.');
    process.exit(1);
  }

  const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));
  const issue = eventData.issue;

  if (!issue) {
    console.warn('No issue data found in event.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are the AI maintainer of this repository. A new issue has been opened.
Please review the issue and provide a helpful, automated response.
If it's a bug report, ask for reproduction steps if missing.
If it's a feature request, discuss its viability based on general principles of an AI corporate credit appraisal system.
Provide guidance and any helpful links.

Issue Title: ${issue.title}
Issue Body: ${issue.body}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const commentBody = response.text || "Thank you for the issue. I will look into this.";
    fs.writeFileSync('triage-comment.txt', commentBody);
    console.info('Triage comment written to triage-comment.txt');
  } catch (error) {
    console.error('Failed to generate triage response:', error);
    process.exit(1);
  }
}

void triage();
