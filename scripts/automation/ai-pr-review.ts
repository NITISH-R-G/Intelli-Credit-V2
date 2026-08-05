import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';

async function reviewPR() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('GEMINI_API_KEY is not set. Exiting gracefully.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  let eventPayload;
  if (eventPath) {
    try {
      eventPayload = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
    } catch (err) {
      console.warn('Failed to read GITHUB_EVENT_PATH:', err);
    }
  }

  const prTitle = eventPayload?.pull_request?.title || 'Unknown PR Title';
  const prBody = eventPayload?.pull_request?.body || '';

  let prDiff = '';
  try {
    prDiff = fs.readFileSync('pr-diff.txt', 'utf8');
  } catch (err) {
    console.error('Failed to read pr-diff.txt:', err);
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert AI Maintainer reviewing a Pull Request.
Provide constructive, clear, and actionable feedback.

PR Title: ${prTitle}
PR Body: ${prBody}

Diff:
${prDiff}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const reply = response.text;
    fs.writeFileSync('pr-comment.txt', reply);
    console.info('PR review comment generated successfully.');
  } catch (err) {
    console.error('Failed to generate AI response:', err);
    process.exit(1);
  }
}

void reviewPR();
