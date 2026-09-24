import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function triage() {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is missing. Skipping AI triage.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH is not set.');
    process.exit(1);
  }

  try {
    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf-8')) as Record<string, any>;
    const issueTitle = eventData.issue?.title || 'Unknown Issue';
    const issueBody = eventData.issue?.body || 'No description provided.';
    const issueNumber = eventData.issue?.number;

    if (!issueNumber) {
      console.warn('No issue number found in event payload.');
      process.exit(0);
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `You are a senior open-source maintainer. An issue has been opened in the Intelli-Credit-V2 repository.
Please provide a polite, helpful triage response acknowledging the issue, summarizing it, and suggesting potential next steps or questions to clarify.

Issue Title: ${issueTitle}
Issue Body: ${issueBody}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const reply = response.text || 'Thank you for your issue! We will look into it shortly.';

    fs.writeFileSync('triage-comment.txt', reply, 'utf-8');
    console.info('Triage comment successfully written to triage-comment.txt');
  } catch (err) {
    console.error('Error during AI triage:', err);
    process.exit(1);
  }
}

void triage();
