import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';

async function triage() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Exiting ai-triage.ts gracefully.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !fs.existsSync(eventPath)) {
    console.error('GITHUB_EVENT_PATH is not set or file does not exist.');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });

  let issueData: Record<string, unknown> = {};
  try {
    const rawData = fs.readFileSync(eventPath, 'utf8');
    issueData = JSON.parse(rawData) as Record<string, unknown>;
  } catch (err) {
    console.error('Failed to read or parse event payload.', err);
    process.exit(1);
  }

  const issue = issueData.issue as Record<string, unknown>;
  if (!issue) {
    console.error('No issue object found in event payload.');
    process.exit(1);
  }

  const title = String(issue.title || '');
  const body = String(issue.body || '');

  const prompt = `You are a senior staff engineer AI maintainer.
Please review the following issue and provide a triage response. Explain findings, recommend next steps, and be helpful to the contributor.
Keep the response clear and actionable. Do not output anything other than the response body itself.

Issue Title: ${title}

Issue Body:
${body}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const aiResponseText = response.text || 'No response from AI.';

    fs.writeFileSync('triage-comment.txt', aiResponseText);
    console.info('Successfully generated triage response.');
  } catch (err) {
    console.error('Failed to generate AI response.', err);
    process.exit(1);
  }
}

void triage();
