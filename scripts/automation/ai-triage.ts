import fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function triage() {
  if (!process.env.GEMINI_API_KEY) {
    console.info('GEMINI_API_KEY not found. Skipping AI Triage.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const eventPath = process.env.GITHUB_EVENT_PATH;

  if (!eventPath || !fs.existsSync(eventPath)) {
    console.error('GITHUB_EVENT_PATH is not set or file does not exist.');
    process.exit(1);
  }

  try {
    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
    const issueTitle = eventData.issue?.title || '';
    const issueBody = eventData.issue?.body || '';

    const prompt = `You are a senior maintainer for Intelli-Credit, an AI-powered corporate credit appraisal system built with React, Express, and the Google GenAI SDK.
Please triage the following issue. Provide a brief analysis, suggest a priority, identify potential files involved, and suggest any immediate steps for contributors.
Keep the tone helpful and professional.

Issue Title: ${issueTitle}
Issue Body: ${issueBody}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text || 'No response generated.';
    fs.writeFileSync('triage-comment.txt', report);
    console.info('Triage report generated successfully.');
  } catch (err) {
    console.error('Error during AI triage:', err);
    process.exit(1);
  }
}

void triage();
