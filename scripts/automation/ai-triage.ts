import * as fs from 'fs';
import * as path from 'path';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('GEMINI_API_KEY is missing. Skipping AI triage to allow external fork PRs.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

async function triage() {
  try {
    const eventPath = process.env.GITHUB_EVENT_PATH;
    if (!eventPath) {
      console.error('GITHUB_EVENT_PATH is not set.');
      process.exit(0);
    }

    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));

    if (!eventData.issue) {
      console.error('No issue data found in event payload.');
      process.exit(0);
    }

    const title = eventData.issue.title;
    const body = eventData.issue.body || '';

    const prompt = `
You are an expert AI open-source maintainer for a TypeScript React repository.
A new issue has been opened. Please analyze the issue and provide:
1. A polite, welcoming acknowledgment to the contributor.
2. A brief analysis of the problem or request.
3. Suggested labels for the issue (e.g., bug, enhancement, documentation).
4. If applicable, actionable next steps or questions to clarify the issue.

Issue Title: ${title}
Issue Body: ${body}

Keep your response professional and helpful. Format your response in Markdown.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const responseText =
      response.text || 'Thank you for opening this issue! We will review it shortly.';

    fs.writeFileSync('triage-comment.txt', responseText, 'utf-8');
    console.info('Successfully generated triage comment to triage-comment.txt');
  } catch (error) {
    console.error('Error during AI triage:', error);
    process.exit(0);
  }
}

void triage();
