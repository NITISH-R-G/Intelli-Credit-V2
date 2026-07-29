import * as fs from 'fs';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.info('GEMINI_API_KEY is not set. Exiting ai triage.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

async function triage() {
  try {
    const eventPath = process.env.GITHUB_EVENT_PATH;
    if (!eventPath) {
      console.warn('GITHUB_EVENT_PATH not set.');
      return;
    }

    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
    const issue = eventData.issue;
    if (!issue) {
      console.warn('No issue found in event data.');
      return;
    }

    const title = issue.title;
    const body = issue.body || '';

    const prompt = `You are an AI maintainer for the Intelli-Credit Terminal repository.
Please triage the following issue:
Title: ${title}
Body: ${body}

Provide a polite and helpful welcome message to the user, suggest some initial labels, and identify the category of the issue (e.g., Bug, Feature Request, Question). Format your response clearly so it can be posted as a comment.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const commentBody = response.text || 'Thank you for your issue! We will look into it shortly.';
    fs.writeFileSync('triage-comment.txt', commentBody);
    console.info('Triage comment generated successfully.');
  } catch (error) {
    console.error('Error in ai triage:', error);
  }
}

void triage();
