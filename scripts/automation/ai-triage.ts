import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';

async function triageIssue() {
  console.info('Starting AI issue triaging...');

  const issueBody = process.env.ISSUE_BODY;
  const issueTitle = process.env.ISSUE_TITLE;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.info(
      'GEMINI_API_KEY environment variable is missing. Skipping AI Triage (likely running from a fork without secrets).',
    );
    process.exit(0);
  }
  if (!issueBody && !issueTitle) {
    console.info('No issue provided for triaging.');
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    const prompt = `Analyze this GitHub issue and suggest relevant labels, priority, and a brief automated response:\nTitle: ${issueTitle}\nBody: ${issueBody}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    console.info('AI Triage Result written to triage-comment.txt');
    fs.writeFileSync('triage-comment.txt', response.text || 'No triage generated.');
  } catch (error) {
    console.error('Error during AI triaging:', error);
    process.exit(1);
  }
}

triageIssue();
