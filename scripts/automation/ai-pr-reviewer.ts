import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';

async function reviewPR() {
  if (!process.env.GEMINI_API_KEY) {
    console.info('GEMINI_API_KEY not found. Skipping PR Review.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  if (!fs.existsSync('pr-diff.txt')) {
    console.error('pr-diff.txt not found.');
    process.exit(1);
  }

  const prDiff = fs.readFileSync('pr-diff.txt', 'utf8');

  const prompt = `You are a strict but helpful senior software engineer reviewing a pull request. Review the following diff and provide actionable feedback, pointing out bugs, performance issues, security concerns, or style violations. Be concise.

Diff:
${prDiff}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const comment = response.text;
    fs.writeFileSync('pr-comment.txt', comment);
    console.info('PR review generated successfully.');
  } catch (error) {
    console.error('Error generating PR review:', error);
    process.exit(1);
  }
}

void reviewPR();
