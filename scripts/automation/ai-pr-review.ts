import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function reviewPR(): Promise<void> {
  const diffPath = 'pr-diff.txt';
  const eventPath = process.env.GITHUB_EVENT_PATH;

  if (!fs.existsSync(diffPath)) {
    console.error('No pr-diff.txt found.');
    process.exit(0);
  }
  if (!eventPath || !fs.existsSync(eventPath)) {
    console.error('No GITHUB_EVENT_PATH found.');
    process.exit(0);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Skipping AI PR review.');
    process.exit(0);
  }

  try {
    const diffText = fs.readFileSync(diffPath, 'utf8');
    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8')) as Record<string, any>;
    const pullRequest = eventData.pull_request;
    const title = (pullRequest?.title as string) || 'Untitled PR';
    const body = (pullRequest?.body as string) || '';

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert AI PR Reviewer acting like a senior staff engineer. Review the following Pull Request.
Title: ${title}
Body: ${body}

Diff:
${diffText.slice(0, 100000)}

Please provide a concise code review. Point out any security concerns, bugs, or performance issues. Suggest improvements. If the PR looks great, express approval. Avoid nitpicks unless critical.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const aiComment = response.text || 'Unable to generate PR review comment.';
    fs.writeFileSync('pr-comment.txt', aiComment);
    console.info('PR review generated successfully.');
  } catch (error) {
    console.error('Failed to review PR:', error);
    process.exit(1);
  }
}

void reviewPR();
