import { GoogleGenAI } from '@google/genai';
import fs from 'node:fs';

async function triage() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH not set');
    process.exit(1);
  }

  const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const issue = event.issue;

  if (!issue) {
    console.error('No issue found in event payload');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are a senior open-source maintainer triaging a new issue.
Title: ${issue.title}
Body: ${issue.body || 'No description provided.'}

Provide a polite, helpful response acknowledging the issue, suggesting immediate next steps (like providing reproduction steps if missing), or identifying potential solutions or duplicate themes. If it is a feature request, suggest how a contributor might get started. Do not use placeholders. Keep it concise.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    const reply = response.text || 'Thank you for opening this issue! A maintainer will review it shortly.';
    fs.writeFileSync('triage-comment.txt', reply);
    console.info('Triage comment generated successfully.');
  } catch (error) {
    console.error('Failed to generate triage comment:', error);
    process.exit(1);
  }
}

void triage();
