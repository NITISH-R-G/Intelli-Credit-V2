import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import * as path from 'node:path';

async function triage(): Promise<void> {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not set. Exiting gracefully.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !fs.existsSync(eventPath)) {
    console.error('GITHUB_EVENT_PATH not found or file does not exist.');
    process.exit(1);
  }

  try {
    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));

    // Only proceed for issue events (specifically newly opened, unless we want to triage all)
    if (!eventData.issue) {
      console.info('Not an issue event. Exiting.');
      process.exit(0);
    }

    const issueTitle = eventData.issue.title || '';
    const issueBody = eventData.issue.body || '';
    const issueNumber = eventData.issue.number;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `
You are an expert AI Maintainer for this open source repository.
Please review the following new issue and provide a friendly triage comment.
Analyze the issue for missing information, suggest next steps, and categorize it (bug, feature, question).

Issue Title: ${issueTitle}
Issue Body: ${issueBody}

Write a professional, helpful response addressing the contributor directly. Keep it concise.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const triageComment =
      response.text || 'Thank you for your issue. A maintainer will review it soon.';

    // Write the output to triage-comment.txt
    fs.writeFileSync('triage-comment.txt', triageComment, 'utf-8');
    console.info(`Successfully generated triage comment for issue #${issueNumber}`);
  } catch (error) {
    console.error('Error during AI triage:', error);
    process.exit(1);
  }
}

void triage();
