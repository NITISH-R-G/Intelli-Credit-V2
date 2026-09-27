import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function triage(): Promise<void> {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH is not set.');
    process.exit(1);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is missing. Skipping AI triage.');
    process.exit(0);
  }

  let eventData: Record<string, unknown>;
  try {
    const rawData = fs.readFileSync(eventPath, 'utf8');
    eventData = JSON.parse(rawData) as Record<string, unknown>;
  } catch (error) {
    console.error('Failed to read or parse event data', error);
    process.exit(1);
  }

  const issue = eventData.issue as Record<string, unknown> | undefined;
  if (!issue) {
    console.info('No issue data found in event payload.');
    process.exit(0);
  }

  const title = String(issue.title || '');
  const body = String(issue.body || '');

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert AI open-source maintainer.
Please review the following GitHub issue and provide helpful triage feedback.
Analyze the problem, categorize it (bug, feature request, question, etc.), and provide actionable next steps or questions for clarification.

Issue Title: ${title}
Issue Body:
${body}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    if (response.text) {
        fs.writeFileSync('triage-comment.txt', response.text, 'utf8');
        console.info('Triage comment written to triage-comment.txt');
    }
  } catch (error) {
    console.error('Failed to generate AI content', error);
    process.exit(1);
  }
}

void triage();
