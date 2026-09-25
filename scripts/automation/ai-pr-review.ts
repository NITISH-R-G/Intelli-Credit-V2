import * as fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { GoogleGenAI } from '@google/genai';

async function reviewPR(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Exiting ai-pr-review gracefully.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !fs.existsSync(eventPath)) {
    console.error('GITHUB_EVENT_PATH is missing or invalid.');
    process.exit(0);
  }

  try {
    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8')) as Record<string, unknown>;
    const pr = eventData.pull_request as Record<string, unknown> | undefined;

    if (!pr || !pr.url) {
      console.warn('No pull request URL found in event payload.');
      return;
    }

    const prUrl = pr.url as string;
    const githubToken = process.env.GITHUB_TOKEN;

    if (!githubToken) {
      console.warn('GITHUB_TOKEN is not set. Exiting ai-pr-review gracefully.');
      process.exit(0);
    }

    // Fetch PR diff directly from GitHub API using curl
    console.info('Fetching PR diff from GitHub API...');
    const diffBuffer = execFileSync('curl', [
      '-s',
      '-H',
      `Authorization: Bearer ${githubToken}`,
      '-H',
      'Accept: application/vnd.github.v3.diff',
      prUrl,
    ]);
    const diffText = diffBuffer.toString('utf-8');

    if (!diffText) {
      console.warn('Failed to fetch diff or diff is empty.');
      fs.writeFileSync(
        'pr-comment.txt',
        'The pull request diff is empty or could not be retrieved.',
      );
      return;
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a senior AI maintainer for the Intelli-Credit-V2 repository.
Please review the following pull request diff. Look for code quality issues, security vulnerabilities, performance concerns, and adherence to best practices (e.g., using explicit types in TypeScript, no any types, proper Node.js imports).
Also generate a high-level summary of the changes.

PR Diff:
${diffText}

Provide constructive feedback and recommendations in Markdown format.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const aiResponse = response.text || 'Unable to generate review at this time.';
    fs.writeFileSync('pr-comment.txt', aiResponse);
    console.info('Successfully generated PR review comment.');
  } catch (error) {
    console.error('Error during AI PR review processing:', error);
    process.exit(1);
  }
}

void reviewPR();
