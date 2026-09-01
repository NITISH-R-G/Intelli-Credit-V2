import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function reviewPR(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('GEMINI_API_KEY is not set. Exiting ai-pr-review gracefully.');
    process.exit(0);
  }

  const diffPath = 'pr-diff.txt';
  if (!fs.existsSync(diffPath)) {
    console.error('pr-diff.txt not found.');
    process.exit(1);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH is not set.');
    process.exit(1);
  }

  try {
    const prDiff = fs.readFileSync(diffPath, 'utf8');
    if (!prDiff.trim()) {
      console.info('PR diff is empty.');
      process.exit(0);
    }

    const eventPayload = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
    const prTitle = eventPayload.pull_request?.title || '';
    const prBody = eventPayload.pull_request?.body || '';

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an AI PR reviewer. Review the following pull request:
Title: ${prTitle}
Body: ${prBody}

Diff:
${prDiff}

Provide constructive feedback, identify potential issues, and suggest improvements. Focus on code quality, security, and best practices. Keep it professional.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const aiResponse =
      response.text ||
      'The PR looks good from an initial scan, but manual review is still recommended.';

    fs.writeFileSync('pr-comment.txt', aiResponse);
    console.info('PR review comment written to pr-comment.txt');
  } catch (err) {
    console.error('Error during PR review:', err);
    process.exit(1);
  }
}

void reviewPR();
