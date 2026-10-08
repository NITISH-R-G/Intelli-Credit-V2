import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function triage(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    return;
  }

  const eventPayload = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));
  const issue = eventPayload.issue;
  if (!issue) {
    return;
  }

  const prompt = `
You are the lead AI maintainer for Intelli-Credit Terminal, an advanced corporate credit appraisal system.
A new issue has been opened.
Title: ${issue.title}
Body: ${issue.body}

Please provide a helpful, welcoming, and professional triage response.
Acknowledge the issue, mention any immediate thoughts, and state that the team will look into it.
If the issue is a bug report, suggest if more information is needed.
If it's a feature request, discuss its potential.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    fs.writeFileSync('triage-comment.txt', response.text || '');
  } catch {
    // Ignore error
  }
}

await triage().catch(() => {
  process.exit(1);
});
