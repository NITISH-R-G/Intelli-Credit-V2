import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';
import { execFileSync } from 'node:child_process';

async function reviewPR(): Promise<void> {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH not set.');
    process.exit(1);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set. Skipping PR review.');
    process.exit(0);
  }

  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    console.error('GITHUB_TOKEN not set.');
    process.exit(1);
  }

  const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const pr = eventData.pull_request;

  if (!pr) {
    console.info('No pull request found in event payload.');
    process.exit(0);
  }

  try {
    const diffUrl = pr.url;
    const diff = (execFileSync('curl', [
      '-s',
      '-H',
      `Authorization: Bearer ${githubToken}`,
      '-H',
      'Accept: application/vnd.github.v3.diff',
      diffUrl
    ]) as unknown as Buffer).toString('utf-8');

    if (!diff) {
      console.info('No diff found or diff is empty.');
      process.exit(0);
    }

    fs.writeFileSync('pr-diff.txt', diff);

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are an expert senior software engineer reviewing a pull request.
Title: ${pr.title}
Body: ${pr.body}

Here is the diff:
${diff}

Please review the diff for code quality, security, and potential bugs. Provide constructive feedback. Keep the review concise.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const comment = response.text;
    if (comment) {
      fs.writeFileSync('pr-comment.txt', comment);
      console.info('PR review comment generated successfully.');
    } else {
       console.error('No response from Gemini.');
       process.exit(1);
    }
  } catch (error) {
    console.error('Error generating PR review:', error);
    process.exit(1);
  }
}

reviewPR().catch((error) => {
  console.error('Unhandled error in reviewPR:', error);
  process.exit(1);
});
