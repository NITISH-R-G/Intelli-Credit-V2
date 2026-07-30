import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';

async function triage() {
  if (!process.env.GEMINI_API_KEY) {
    console.info('GEMINI_API_KEY not found. Skipping AI triage gracefully.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !fs.existsSync(eventPath)) {
    console.error('GITHUB_EVENT_PATH not found or file does not exist.');
    process.exit(1);
  }

  const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));
  const issue = eventData.issue;

  if (!issue) {
    console.warn('No issue found in event payload.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `You are an expert AI maintainer for the Intelli-Credit repository.
Please review the following issue and provide a triage response.
Categorize the request, suggest a priority, identify any missing context, and propose next steps or initial troubleshooting ideas.

Title: ${issue.title}
Body:
${issue.body || 'No description provided.'}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    const reply = response.text;
    fs.writeFileSync('triage-comment.txt', reply, 'utf-8');
    console.info('Successfully generated triage comment.');
  } catch (error) {
    console.error('Error calling Gemini API for triage:', error);
    process.exit(1);
  }
}

void triage();
