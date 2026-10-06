import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function triage() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is missing. Exiting triage script gracefully.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });
  const eventPath = process.env.GITHUB_EVENT_PATH;

  if (!eventPath || !fs.existsSync(eventPath)) {
    console.error('GITHUB_EVENT_PATH is not set or file does not exist.');
    process.exit(1);
  }

  const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const issueTitle = eventData.issue?.title || 'Unknown Issue';
  const issueBody = eventData.issue?.body || 'No description provided.';

  const prompt = `
    You are an AI maintainer for a corporate credit appraisal system.
    Please triage the following issue and provide a friendly, helpful automated response.
    Suggest any immediate steps, labels to apply, or ask for clarification if needed.
    Keep the response concise and actionable.

    Issue Title: ${issueTitle}
    Issue Body: ${issueBody}
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt
    });

    const comment = response.text || 'Thank you for your issue. A maintainer will review it shortly.';
    fs.writeFileSync('triage-comment.txt', comment);
    console.info('Triage comment generated successfully.');
  } catch (err) {
    console.error('Error generating triage comment:', err);
    process.exit(1);
  }
}

await triage().catch((err) => {
  console.error('Unhandled error in triage:', err);
  process.exit(1);
});
