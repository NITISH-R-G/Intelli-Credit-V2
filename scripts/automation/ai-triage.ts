import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';

async function triageIssue() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !fs.existsSync(eventPath)) {
    console.error('GITHUB_EVENT_PATH is not set or file does not exist.');
    return;
  }

  const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  if (!eventData.issue) {
    console.error('No issue data found in event payload.');
    return;
  }

  const title = eventData.issue.title || '';
  const body = eventData.issue.body || '';

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set.');
    return;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Analyze the following issue and suggest a single word label for it (e.g., bug, feature, documentation, question). Issue Title: ${title}. Issue Body: ${body}. Only respond with the label name, in lowercase.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const label = response.text?.trim() || 'triage';
    console.info(`Suggested label: ${label}`);
  } catch (error) {
    console.error('Error querying Gemini:', error);
  }
}

triageIssue();
