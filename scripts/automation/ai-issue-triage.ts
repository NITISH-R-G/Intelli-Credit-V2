import fs from 'node:fs';
import path from 'node:path';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.info('GEMINI_API_KEY is missing. Skipping AI issue triage.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

async function triage(): Promise<void> {
  try {
    const eventPath = process.env.GITHUB_EVENT_PATH;
    if (!eventPath || !fs.existsSync(eventPath)) {
      console.warn('GITHUB_EVENT_PATH not found or file does not exist.');
      return;
    }

    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
    const issueTitle = eventData.issue?.title || '';
    const issueBody = eventData.issue?.body || '';
    const issueAuthor = eventData.issue?.user?.login || '';

    if (!issueTitle && !issueBody) {
      console.warn('No issue title or body found in event data.');
      return;
    }

    console.info(`Triaging issue from ${issueAuthor}: ${issueTitle}`);

    const prompt = `
You are an expert AI repository maintainer for "Intelli-Credit Terminal", an AI-powered corporate credit appraisal system using Google Gemini.
A new issue has been opened by @${issueAuthor}.

Issue Title: ${issueTitle}
Issue Body: ${issueBody}

Please provide a helpful, welcoming, and concise response to the user.
1. Acknowledge the issue.
2. Provide initial triage (e.g., if it's a bug, ask for repro steps if missing; if it's a feature, discuss its potential).
3. If relevant to the repository's context (React, Node, Express, Google GenAI), offer a preliminary suggestion or pointer to where the code might be affected.
4. Keep the response professional and maintainer-like.

Output ONLY the raw markdown text for the GitHub comment. Do not use markdown code blocks to wrap the entire response.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const comment = response.text || '';
    if (comment) {
      fs.writeFileSync('triage-comment.txt', comment, 'utf8');
      console.info('Triage comment generated successfully.');
    } else {
      console.warn('AI generated an empty response.');
    }
  } catch (error) {
    console.error('Error during issue triage:', error);
    process.exit(1);
  }
}

void triage();
