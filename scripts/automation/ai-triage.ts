import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';

async function triage(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('GEMINI_API_KEY is not set. Skipping AI triage.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !fs.existsSync(eventPath)) {
    console.warn('GITHUB_EVENT_PATH not found or does not exist.');
    return;
  }

  const eventPayload = JSON.parse(fs.readFileSync(eventPath, 'utf8')) as {
    issue?: { title: string; body: string };
  };

  const issue = eventPayload.issue;
  if (!issue) {
    console.warn('No issue found in event payload.');
    return;
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `You are an expert AI maintainer for the Intelli-Credit Terminal repository.
Please triage this issue by providing a short, helpful response (less than 200 words), categorizing the issue, and suggesting next steps.

Issue Title: ${issue.title}
Issue Body: ${issue.body}`,
    });

    const comment = response.text;
    fs.writeFileSync(
      'triage-comment.txt',
      comment || 'Thank you for your issue. A maintainer will review it shortly.',
    );
    console.info('AI Triage completed successfully.');
  } catch (error) {
    console.error('Error during AI Triage:', error);
  }
}

void triage();
