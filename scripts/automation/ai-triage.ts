import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';

async function triage() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Exiting gracefully.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH is not set.');
    process.exit(1);
  }

  const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const issue = eventData.issue;

  if (!issue) {
    console.warn('No issue data found in event.');
    process.exit(0);
  }

  const title = issue.title;
  const body = issue.body || '';

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert AI repository maintainer.
Please analyze the following GitHub issue and provide a friendly triage response.
You should acknowledge the issue, give a preliminary assessment or suggest next steps, and suggest labels.

Issue Title: ${title}
Issue Body: ${body}

Output your response as markdown. Keep it concise, helpful, and professional.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const comment = response.text || 'Thank you for opening this issue! A maintainer will review it shortly.';

    // Write comment to a file instead of stdout to avoid logging noise and pipe issues
    fs.writeFileSync('triage-comment.txt', comment, 'utf-8');
    console.info('Successfully generated triage comment.');
  } catch (error) {
    console.error('Failed to generate triage comment via Gemini:', error);
    process.exit(1);
  }
}

void triage();
