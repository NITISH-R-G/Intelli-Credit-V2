import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function triage() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Skipping triage.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !fs.existsSync(eventPath)) {
    console.error('GITHUB_EVENT_PATH not found or invalid.');
    process.exit(1);
  }

  const eventPayload = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));
  const issue = eventPayload.issue;

  if (!issue) {
    console.error('No issue data found in event payload.');
    process.exit(1);
  }

  const title = issue.title;
  const body = issue.body || '';

  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = `You are an expert AI triage bot for an open-source project.
Please analyze the following issue and provide a friendly, helpful response to the contributor.
Include:
1. A polite greeting and thanks for the contribution.
2. A brief analysis or categorization of the issue (e.g., bug, feature request, question).
3. Any immediate steps the user should take or clarifications needed.
4. A note that a human maintainer will look into it soon.

Issue Title: ${title}
Issue Body: ${body}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const aiResponse = response.text || 'Thank you for your issue. We will look into it shortly.';

    fs.writeFileSync('triage-comment.txt', aiResponse);
    console.info('Triage comment generated successfully.');
  } catch (error) {
    console.error('Error generating triage comment:', error);
    process.exit(1);
  }
}

void triage();
