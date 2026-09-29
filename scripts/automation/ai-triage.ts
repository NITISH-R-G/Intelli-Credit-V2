import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function triage(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('GEMINI_API_KEY not found. Skipping triage.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH not found.');
    process.exit(1);
  }

  let eventData: Record<string, unknown>;
  try {
    const rawData = fs.readFileSync(eventPath, 'utf8');
    eventData = JSON.parse(rawData);
  } catch (error) {
    console.error('Failed to read GITHUB_EVENT_PATH', error);
    process.exit(1);
  }

  const issue = eventData.issue as Record<string, unknown> | undefined;
  if (!issue) {
    console.error('No issue data found in event.');
    process.exit(0);
  }

  const title = (issue.title as string) || '';
  const body = (issue.body as string) || '';

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert open-source maintainer and AI assistant for the Intelli-Credit repository.
A new issue has been opened. Your goal is to triage the issue, provide immediate assistance, suggest relevant code files that might need modification, and offer a preliminary plan.

Issue Title: ${title}
Issue Body: ${body}

Please provide a helpful, professional, and detailed comment to welcome the user, address the issue, and provide actionable next steps.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    const resultText = response.text;

    if (resultText) {
      fs.writeFileSync('triage-comment.txt', resultText, 'utf8');
      console.info('Successfully wrote triage comment.');
    }
  } catch (error) {
    console.error('Failed to generate triage comment via Gemini:', error);
    process.exit(1);
  }
}

void triage();
