import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

interface GitHubIssuePayload {
  issue?: {
    title?: string;
    body?: string;
  };
}

async function triage(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Exiting ai-triage successfully.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.warn('GITHUB_EVENT_PATH is not set. Exiting ai-triage successfully.');
    process.exit(0);
  }

  let eventPayload: GitHubIssuePayload;
  try {
    const rawData = fs.readFileSync(eventPath, 'utf8');
    eventPayload = JSON.parse(rawData) as GitHubIssuePayload;
  } catch (error) {
    console.error('Failed to read or parse GITHUB_EVENT_PATH:', error);
    process.exit(1);
  }

  const issue = eventPayload.issue;
  if (!issue) {
    console.warn('No issue found in event payload.');
    process.exit(0);
  }

  const title = issue.title || '';
  const body = issue.body || '';

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
You are an expert open-source maintainer and AI assistant for the Intelli-Credit Terminal repository.
Please review the following new issue and provide a helpful, welcoming, and technical initial response.
If it's a bug report, suggest troubleshooting steps. If it's a feature request, discuss its feasibility and impact.

Issue Title: ${title}
Issue Body: ${body}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    const reply = response.text || 'Thank you for opening this issue! A maintainer will review it shortly.';

    const outputText = `### 🤖 AI Triage Assistant\n\n${reply}`;
    fs.writeFileSync('triage-comment.txt', outputText);
    console.info('Successfully generated triage comment to triage-comment.txt');
  } catch (error) {
    console.error('Error calling Google GenAI:', error);
    process.exit(1);
  }
}

triage().catch(console.error);
