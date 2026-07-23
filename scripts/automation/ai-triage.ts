import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

async function triage() {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not found. Skipping AI triage.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH not set.');
    process.exit(0);
  }

  const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const issue = eventData.issue;

  if (!issue) {
    console.error('No issue data found in event payload.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `
You are an expert open-source maintainer and AI assistant for the Intelli-Credit repository.
A new issue has been opened. Please analyze the issue and provide a friendly, helpful triage response.
If it's a bug, ask for reproduction steps if they are missing.
If it's a feature request, discuss its potential impact and feasibility.
If it's a question, try to answer it based on the context of an AI-powered corporate credit appraisal system using Google Gemini, React, and Express.

Issue Title: ${issue.title}
Issue Body:
${issue.body}
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text || "Thank you for opening this issue! A maintainer will review it shortly.";
    // Ensure we don't accidentally spit out markdown that breaks things if not careful, though it usually is fine
    const outPath = path.join(process.cwd(), 'triage-comment.txt');
    fs.writeFileSync(outPath, text);
    console.info('Triage comment generated successfully.');
  } catch (error) {
    console.error('Error generating triage comment:', error);
    process.exit(0);
  }
}

void triage();
