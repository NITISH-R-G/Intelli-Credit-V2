import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function triage(): Promise<void> {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('No GITHUB_EVENT_PATH provided.');
    process.exit(0);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Skipping AI triage.');
    process.exit(0);
  }

  try {
    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8')) as Record<string, any>;
    const issue = eventData.issue;
    if (!issue) {
      console.error('No issue data found in event.');
      process.exit(0);
    }

    const title = issue.title as string;
    const body = (issue.body as string) || '';

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a senior staff engineer AI triage assistant. Review the following GitHub issue and provide a short, helpful response (max 300 words). Categorize it (Bug, Feature, Question), suggest next steps or immediate labels, and recommend potential files to check if it's a bug.

Title: ${title}
Body: ${body}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const aiComment = response.text || 'Unable to generate triage comment.';

    fs.writeFileSync('triage-comment.txt', aiComment);
    console.info('Triage comment generated successfully.');
  } catch (error) {
    console.error('Failed to triage issue:', error);
    process.exit(1);
  }
}

void triage();
