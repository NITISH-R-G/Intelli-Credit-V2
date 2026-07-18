import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.info('GEMINI_API_KEY not found. Skipping AI triage.');
    process.exit(0);
  }

  const issueBody = process.env.ISSUE_BODY || '';
  if (!issueBody) {
    console.warn('No issue body provided.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Analyze the following issue and provide helpful triage feedback:

${issueBody}

Identify the core problem, ask clarifying questions if needed, and suggest initial steps for a contributor.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const comment = response.text;
    fs.writeFileSync('triage-comment.txt', comment || 'No feedback generated.');
    console.info('Successfully generated triage comment.');
  } catch (err) {
    console.error('Error generating AI response:', err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
