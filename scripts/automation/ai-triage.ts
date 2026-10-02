import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';

async function triage() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is missing');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH is missing');
    process.exit(0);
  }

  try {
    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
    const issue = eventData.issue;

    if (!issue) {
      console.info('No issue found in event payload');
      process.exit(0);
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a senior maintainer analyzing a new issue.
Title: ${issue.title}
Body: ${issue.body || 'No description provided'}

Please provide a helpful triage summary. Recommend labels, identify if this looks like a bug or feature request, and suggest initial steps for contributors. Respond directly in markdown without any introductory conversational filler.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const comment = response.text;
    if (comment) {
      fs.writeFileSync('triage-comment.txt', comment);
      console.info('Triage comment generated successfully.');
    }
  } catch (error) {
    console.error('Error during AI triage:', error);
    process.exit(0);
  }
}

void triage();
