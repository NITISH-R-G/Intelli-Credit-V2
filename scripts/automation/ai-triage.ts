import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function main(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Skipping issue triage.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.warn('GITHUB_EVENT_PATH not found.');
    process.exit(0);
  }

  try {
    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
    const issue = eventData.issue;

    if (!issue) {
      console.info('No issue data found in payload. Exiting.');
      return;
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a helpful AI maintainer for the Intelli-Credit Terminal repository.
Please review the following new issue and provide a friendly, helpful initial response.
Your goal is to:
1. Welcome the contributor.
2. Acknowledge the issue (bug report, feature request, etc.).
3. Suggest potential workarounds or next steps if applicable.
4. If it's a bug, ask for steps to reproduce if they are missing.

Issue Title: ${issue.title}
Issue Body:
${issue.body}

Provide your response in Markdown format.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text;
    if (text) {
      fs.writeFileSync('triage-comment.txt', text, 'utf8');
      console.info('Successfully generated issue triage comment.');
    } else {
      console.warn('AI generated an empty response.');
    }
  } catch (error) {
    console.error('Error during issue triage:', error);
    process.exit(1);
  }
}

void main();
