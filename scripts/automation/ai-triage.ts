import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';

async function triage(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Skipping AI Triage.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !fs.existsSync(eventPath)) {
    console.error('GITHUB_EVENT_PATH not found or invalid.');
    process.exit(0);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const payload = JSON.parse(fs.readFileSync(eventPath, 'utf8')) as {
      issue?: { title: string; body: string; number: number };
    };

    const issue = payload.issue;
    if (!issue) {
      console.warn('No issue found in payload.');
      process.exit(0);
    }

    const prompt = `Please triage the following issue and provide a friendly, helpful response.\nTitle: ${issue.title}\nBody:\n${issue.body}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const reply = response.text;
    if (reply) {
      fs.writeFileSync('triage-comment.txt', reply);
      console.info('Triage comment generated.');
    } else {
      console.warn('Empty response from AI.');
    }
  } catch (error) {
    console.error('Error during AI Triage:', error);
    process.exit(1);
  }
}

void triage();
