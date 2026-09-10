import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY is missing. Skipping AI triage.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

async function triage() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !fs.existsSync(eventPath)) {
    console.error('GITHUB_EVENT_PATH not found or file does not exist.');
    process.exit(0);
  }

  const eventPayload = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const issue = eventPayload.issue;

  if (!issue) {
    console.info('No issue found in event payload.');
    process.exit(0);
  }

  const prompt = `
You are an expert AI maintainer for an open-source project.
Analyze this issue and provide helpful feedback, labels, and next steps for the contributor.
Issue Title: ${issue.title}
Issue Body: ${issue.body || 'No body provided.'}

Provide a polite and helpful response that:
1. Welcomes the user.
2. Identifies potential causes if it's a bug, or implications if it's a feature.
3. Suggests what information might be missing.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const responseText = response.text;
    if (responseText) {
      fs.writeFileSync('triage-comment.txt', responseText, 'utf8');
      console.info('Triage comment written to triage-comment.txt');
    }
  } catch (error) {
    console.error('Error during AI triage:', error);
    process.exit(0);
  }
}

void triage();
