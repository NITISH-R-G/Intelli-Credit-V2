import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

async function triage() {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not found. Skipping issue triage.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH not found.');
    process.exit(1);
  }

  const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const issue = eventData.issue;

  if (!issue) {
    console.warn('No issue data found in event payload.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `
  You are an expert AI repository maintainer.
  Review the following issue and provide a brief, helpful response thanking the user, summarizing the issue, and suggesting initial steps or asking clarifying questions if needed.
  Keep it professional and concise.

  Issue Title: ${issue.title}
  Issue Body: ${issue.body || 'No body provided.'}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    let text = response.text || '';
    // Format as a simple comment
    text = `🤖 **AI Maintainer Triage**\n\n${text}`;

    fs.writeFileSync('triage-comment.txt', text);
    console.info('Triage comment generated and saved to triage-comment.txt.');
  } catch (error) {
    console.error('Error generating triage comment:', error);
    process.exit(1);
  }
}

void triage();
