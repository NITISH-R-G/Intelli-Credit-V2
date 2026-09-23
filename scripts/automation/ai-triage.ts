import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function triage(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('GEMINI_API_KEY is missing. Skipping AI triage.');
    process.exit(0);
  }

  const eventPath = process.env.ISSUE_EVENT_PATH;
  if (!eventPath) {
    console.error('ISSUE_EVENT_PATH is missing.');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf-8')) as Record<string, unknown>;
    const issue = eventData.issue as Record<string, unknown> | undefined;

    if (!issue) {
      console.error('No issue data found in event payload.');
      process.exit(1);
    }

    const title = issue.title as string;
    const body = issue.body as string || 'No description provided.';
    const author = (issue.user as Record<string, unknown>).login as string;

    const prompt = `You are a senior staff engineer and AI maintainer for the Intelli-Credit Terminal repository.
An issue was just opened. Analyze it and provide a triage response.

Issue Title: ${title}
Issue Author: ${author}
Issue Body:
${body}

Your response should:
1. Welcome the contributor.
2. Acknowledge the core problem or request.
3. Suggest initial troubleshooting steps, relevant code areas to look at, or ask for clarifying information if needed.
4. Keep it concise, helpful, and professional.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const comment = response.text;
    if (comment) {
      fs.writeFileSync('triage-comment.txt', comment);
      console.info('Successfully generated triage comment.');
    } else {
      console.warn('AI generated an empty response.');
    }
  } catch (error) {
    console.error('Error during AI triage:', error);
    process.exit(1);
  }
}

void triage();