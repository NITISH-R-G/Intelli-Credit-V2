import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function triage(): Promise<void> {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH not set.');
    process.exit(1);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set. Exiting gracefully.');
    process.exit(0);
  }

  try {
    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));

    // Only process new issues (adjust logic as needed)
    if (eventData.action !== 'opened' || !eventData.issue) {
       console.info('Not an issue opening event. Exiting.');
       return;
    }

    const ai = new GoogleGenAI({ apiKey });

    const issueTitle = eventData.issue.title;
    const issueBody = eventData.issue.body || 'No description provided.';

    const prompt = `You are an expert AI open source maintainer. Analyze this issue:
Title: ${issueTitle}
Body: ${issueBody}

Please provide a helpful, polite, and actionable response. Acknowledge the issue, suggest immediate troubleshooting steps or workarounds if applicable, and mention that a maintainer will review it shortly.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    if (response.text) {
        fs.writeFileSync('triage-comment.txt', response.text);
        console.info('Successfully generated triage comment.');
    } else {
        console.warn('No response text generated from Gemini.');
    }

  } catch (error) {
    console.error('Error during triage:', error);
    process.exit(1);
  }
}

void triage();
