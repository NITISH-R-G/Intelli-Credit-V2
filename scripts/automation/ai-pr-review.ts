import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';
import { execFileSync } from 'node:child_process';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set. Exiting gracefully.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });
const eventPath = process.env.GITHUB_EVENT_PATH;

async function runReview(): Promise<void> {
  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH not set.');
    process.exit(1);
  }

  try {
    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
    const pr = eventData.pull_request;
    if (!pr) {
      console.error('No pull_request data found in event payload.');
      process.exit(0);
    }

    let diff = '';
    if (fs.existsSync('pr-diff.txt')) {
      diff = fs.readFileSync('pr-diff.txt', 'utf8');
    } else {
      console.warn('pr-diff.txt not found, fallback to GitHub API is needed or diff is empty.');
    }

    const title = pr.title;
    const body = pr.body || '';
    const prompt = `Review this Pull Request.\n\nTitle: ${title}\n\nBody: ${body}\n\nDiff:\n${diff}\n\nProvide constructive feedback, identify any bugs or security issues, and suggest improvements.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const output = response.text || 'Review completed but no suggestions generated.';
    fs.writeFileSync('pr-comment.txt', output);
    console.info('PR review completed successfully.');
  } catch (e) {
    console.error('Error during PR review:', e);
    process.exit(1);
  }
}

void runReview();
