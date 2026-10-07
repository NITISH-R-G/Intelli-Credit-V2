import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function triage() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });
  const eventPath = process.env.GITHUB_EVENT_PATH;

  if (!eventPath || !fs.existsSync(eventPath)) {
    process.exit(0);
  }

  const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const issue = eventData.issue;

  if (!issue) {
    process.exit(0);
  }

  const prompt = `Please triage the following issue and provide a short summary, recommend labels, and suggest a next step:

Title: ${issue.title}
Body: ${issue.body || 'No description provided.'}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  });

  const triageComment = response.text || 'No response generated.';
  fs.writeFileSync('triage-comment.txt', triageComment);
}

await triage().catch(() => process.exit(1));
