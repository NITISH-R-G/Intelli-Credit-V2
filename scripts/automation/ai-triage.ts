import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('GEMINI_API_KEY not found. Exiting gracefully.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

async function triage() {
  try {
    const eventPath = process.env.GITHUB_EVENT_PATH;
    if (!eventPath) {
      console.warn('GITHUB_EVENT_PATH not found.');
      return;
    }

    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));
    const issue = eventData.issue;
    if (!issue) {
      console.warn('No issue found in event data.');
      return;
    }

    const title = issue.title;
    const body = issue.body || '';

    const prompt = `You are an expert AI maintainer for an open source repository.
A new issue has been opened:

Title: ${title}
Body: ${body}

Analyze this issue and provide:
1. A polite welcome and acknowledgment.
2. An initial triage (is it a bug, feature request, question, etc.).
3. If it is a bug, suggestions for reproducing it or a hypothesis of the cause.
4. If it is a feature request, some thoughts on its feasibility.
5. If more info is needed, what should the user provide?

Format the response in Markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    fs.writeFileSync('triage-comment.txt', response.text);
    console.info('Successfully generated triage comment.');
  } catch (error) {
    console.error('Error during issue triage:', error);
    process.exit(1);
  }
}

triage().catch(console.error);
