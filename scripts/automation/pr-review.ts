import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function reviewPR() {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not set. Skipping PR review.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const eventPath = process.env.GITHUB_EVENT_PATH;

  if (!eventPath || !fs.existsSync(eventPath)) {
    console.error('GITHUB_EVENT_PATH is missing or invalid.');
    process.exit(0);
  }

  const eventPayload = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));
  const pr = eventPayload.pull_request;

  if (!pr) {
    console.warn('Not a pull request event. Skipping.');
    process.exit(0);
  }

  let diff = '';
  try {
    if (fs.existsSync('pr-diff.txt')) {
      diff = fs.readFileSync('pr-diff.txt', 'utf-8');
    } else {
      console.warn('pr-diff.txt not found. Unable to review code changes.');
      process.exit(0);
    }
  } catch (error) {
    console.error('Error reading pr-diff.txt:', error);
    process.exit(0);
  }

  const prompt = `
  You are an expert AI software engineer and code reviewer.
  Please review the following pull request diff.

  PR Title: ${pr.title}
  PR Body: ${pr.body || ''}

  Diff:
  ${diff}

  Provide a helpful, constructive review. Focus on architecture, performance, security, and maintainability.
  Highlight positive changes and suggest actionable improvements if there are potential issues.
  If the changes look good, you can simply state that.
  Do not use markdown blocks for the whole text, just write it as a natural comment.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const comment = response.text || 'Changes look good! Thanks for your contribution.';
    fs.writeFileSync('pr-comment.txt', comment);
    console.info('PR review comment generated successfully.');
  } catch (error) {
    console.error('Error during AI PR review:', error);
  }
}

reviewPR().catch(console.error);
