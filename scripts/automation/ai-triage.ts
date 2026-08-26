import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function triage(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Skipping triage.');
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
    console.info('No issue found in event payload.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are the AI maintainer for the Intelli-Credit repository.
A new issue has been opened:
Title: ${issue.title}
Body: ${issue.body}

Please provide a helpful, welcoming, and technical automated response to the issue creator. Suggest possible areas of the codebase to look into or next steps. Format the output in Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    const text = response.text || '';
    fs.writeFileSync('triage-comment.txt', text);
    console.info('Successfully generated triage response.');
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    process.exit(1);
  }
}

triage().catch((e) => {
  console.error(e);
  process.exit(1);
});
