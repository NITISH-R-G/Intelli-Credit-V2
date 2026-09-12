import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import * as path from 'node:path';

async function triage() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('No GEMINI_API_KEY found, skipping triage.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('No GITHUB_EVENT_PATH found.');
    process.exit(1);
  }

  const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));
  const issue = eventData.issue;
  if (!issue) {
    console.error('No issue data found in event.');
    process.exit(0); // Not an issue event, or invalid format
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert AI maintainer for the Intelli-Credit repository.
An issue has been opened. Please analyze it and provide a polite, helpful response.

Issue Title: ${issue.title}
Issue Body:
${issue.body}

Provide a response that:
1. Welcomes the user and acknowledges the issue.
2. Identifies if it's a bug, feature request, or question.
3. Suggests next steps or asks clarifying questions if needed.
4. Keep it professional, concise, and helpful.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    fs.writeFileSync(
      'triage-comment.txt',
      response.text || 'Thank you for opening this issue. We will review it shortly.',
    );
    console.info('Triage comment generated successfully.');
  } catch (error) {
    console.error('Failed to generate triage comment:', error);
    process.exit(1);
  }
}

void triage();
