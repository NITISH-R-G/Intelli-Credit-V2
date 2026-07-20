import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.info('GEMINI_API_KEY is not set. Skipping AI triage.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });
const issueBody = process.env.ISSUE_BODY || '';

async function triageIssue() {
  if (!issueBody) {
    console.info('No issue body provided. Skipping AI triage.');
    process.exit(0);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `You are an expert AI maintainer for the Intelli-Credit-V2 repository.
Analyze the following issue and provide a helpful, welcoming response.
Include:
- A brief summary of the issue.
- Potential causes or areas in the codebase to look at.
- Next steps or clarifying questions if needed.
- If it's a bug, suggest a potential fix or workaround.

Issue Body:
${issueBody}`,
    });

    const comment = response.text;
    if (comment) {
      fs.writeFileSync('triage-comment.txt', comment, 'utf-8');
      console.info('Successfully generated triage comment.');
    } else {
      console.warn('AI generated an empty response.');
    }
  } catch (error) {
    console.error('Error during AI triage:', error);
    process.exit(0); // Graceful exit
  }
}

triageIssue();
