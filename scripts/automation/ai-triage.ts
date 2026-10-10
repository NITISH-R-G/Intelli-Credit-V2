import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  process.stderr.write('GEMINI_API_KEY is not set.\n');
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey });

async function triage(): Promise<void> {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !fs.existsSync(eventPath)) {
    process.stderr.write('No GITHUB_EVENT_PATH found.\n');
    process.exit(0);
  }

  const eventPayload = JSON.parse(fs.readFileSync(eventPath, 'utf-8')) as Record<string, any>;
  const issue = eventPayload.issue as Record<string, any> | undefined;
  if (!issue) {
    process.stderr.write('Not an issue event.\n');
    process.exit(0);
  }

  const title = String(issue.title);
  const body = String(issue.body || '');

  const prompt = `You are a senior AI open-source maintainer for Intelli-Credit. An issue was just opened.
Title: ${title}
Body: ${body}

Provide a polite and helpful triage response. Acknowledge the issue, explain what kind of information might be needed next, and suggest potential areas in the codebase that might be relevant based on the description. Do NOT include markdown code blocks around your entire response.
`;

  const response = await ai.models
    .generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })
    .catch((err) => {
      process.stderr.write(`Failed to triage: ${err}\n`);
      process.exit(1);
    });

  if (response && response.text) {
    fs.writeFileSync('triage-comment.txt', response.text);
    process.stdout.write('Generated triage comment.\n');
  }
}

await triage().catch((err) => {
  process.stderr.write(`Error: ${err}\n`);
  process.exit(1);
});
