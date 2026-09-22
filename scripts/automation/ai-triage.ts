import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function triage(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is missing. Skipping AI triage.');
    return;
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !fs.existsSync(eventPath)) {
    console.error('GITHUB_EVENT_PATH is missing or invalid.');
    process.exitCode = 1;
    return;
  }

  let eventPayload: Record<string, unknown>;
  try {
    eventPayload = JSON.parse(fs.readFileSync(eventPath, 'utf-8')) as Record<string, unknown>;
  } catch {
    console.error('Failed to parse event payload.');
    process.exitCode = 1;
    return;
  }

  const issue = eventPayload.issue as Record<string, unknown> | undefined;
  if (!issue) {
    console.warn('No issue found in event payload.');
    return;
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are a helpful senior staff engineer and open-source maintainer for an advanced AI-powered corporate credit appraisal system built with React, Express, and Google Gemini.
A new issue has been opened.
Please provide a polite, helpful triage response. Acknowledge the issue, suggest potential first steps or areas in the codebase to look at if applicable, and assign appropriate labels in your mind (just tell them what kind of issue this seems to be). Keep it concise.

Issue Title: ${String(issue.title)}
Issue Body:
${String(issue.body)}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    if (response.text) {
      fs.writeFileSync('triage-comment.txt', response.text, 'utf-8');
      console.info('Triage comment generated successfully.');
    } else {
      console.warn('AI generated empty response.');
    }
  } catch (error) {
    console.error('Error generating AI response:', error);
    process.exitCode = 1;
    return;
  }
}

void triage();
