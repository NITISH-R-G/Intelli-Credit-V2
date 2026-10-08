import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function reviewPR(): Promise<void> {
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
  const pr = eventPayload.pull_request;
  if (!pr) {
    return;
  }

  let diff = '';
  try {
    diff = fs.readFileSync('pr-diff.txt', 'utf-8');
  } catch {
    return;
  }

  const prompt = `
You are the lead AI maintainer for Intelli-Credit Terminal, an advanced corporate credit appraisal system.
A new pull request has been opened or updated.
Title: ${pr.title}
Body: ${pr.body}

Here is the diff:
${diff}

Please provide a code review. Be encouraging, point out potential bugs or security issues, check for code style issues, and suggest improvements.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    fs.writeFileSync('pr-comment.txt', response.text || '');
  } catch {
    // Ignore error
  }
}

await reviewPR().catch(() => {
  process.exit(1);
});
