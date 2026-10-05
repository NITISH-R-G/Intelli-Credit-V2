import * as fs from 'node:fs';
import { initGenAI } from './utils.js';

async function triage(): Promise<void> {
  const ai = initGenAI();
  if (!ai) return;

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !fs.existsSync(eventPath)) {
    console.error('GITHUB_EVENT_PATH not found or invalid.');
    process.exit(1);
  }

  const payload = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const issue = payload.issue;

  if (!issue) {
    console.warn('No issue found in payload.');
    process.exit(0);
  }

  const prompt = `You are a senior maintainer for Intelli-Credit, an AI-powered corporate credit appraisal system using Google Gemini.
A new issue has been opened:
Title: ${issue.title}
Body: ${issue.body || 'No description provided.'}

Please provide a helpful and welcoming triage response for this issue. Do not use generic corporate jargon. Suggest potential next steps or labels, and offer guidance if the user is asking a question or reporting a bug.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const feedback =
      response.text ||
      'Thank you for opening this issue! A human maintainer will take a look shortly.';
    fs.writeFileSync('triage-comment.txt', feedback);
    console.info('Triage comment generated successfully.');
  } catch (err: unknown) {
    console.error('Failed to generate triage comment:', err);
    process.exit(1);
  }
}

void triage();
