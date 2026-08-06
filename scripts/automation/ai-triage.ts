import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.info('GEMINI_API_KEY not provided. Skipping AI triage.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });
const model = 'gemini-2.0-flash';

async function triage(): Promise<void> {
  try {
    const eventPath = process.env.GITHUB_EVENT_PATH;
    if (!eventPath) {
      console.error('GITHUB_EVENT_PATH not set.');
      process.exit(1);
    }

    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));
    const issueTitle = eventData.issue?.title || 'No Title';
    const issueBody = eventData.issue?.body || 'No Body';

    const prompt = `You are a senior open-source maintainer triaging a new issue.
Issue Title: ${issueTitle}
Issue Body: ${issueBody}

Analyze the issue and provide a polite, helpful response for the contributor.
Include:
1. A brief summary of the issue.
2. Suggested labels (e.g. bug, enhancement, documentation).
3. Any clarifying questions if needed.
4. If it's a bug, suggest potential areas in the codebase to look at.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    const commentText = response.text;

    if (commentText) {
      fs.writeFileSync('triage-comment.txt', commentText, 'utf-8');
      console.info('Triage comment generated successfully.');
    } else {
      console.warn('AI returned an empty response.');
    }
  } catch (error) {
    console.error('Failed to run AI triage:', error);
    process.exit(1);
  }
}

void triage();
