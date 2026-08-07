import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';

async function triage() {
  if (!process.env.GEMINI_API_KEY) {
    console.info('GEMINI_API_KEY not found. Skipping AI Triage.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const eventPath = process.env.GITHUB_EVENT_PATH;

  if (!eventPath || !fs.existsSync(eventPath)) {
    console.error('GITHUB_EVENT_PATH not found or file does not exist.');
    process.exit(1);
  }

  const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const issueTitle = eventData.issue?.title || '';
  const issueBody = eventData.issue?.body || '';

  const prompt = `You are a helpful AI maintainer. Triage the following issue:
Title: ${issueTitle}
Body: ${issueBody}
Provide a polite response, categorize it (bug, feature request, etc.), and suggest next steps. Limit to 3 short paragraphs.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const comment = response.text;
    fs.writeFileSync('triage-comment.txt', comment);
    console.info('Triage comment generated successfully.');
  } catch (error) {
    console.error('Error generating triage comment:', error);
    process.exit(1);
  }
}

void triage();
