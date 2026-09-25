import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function reviewPR(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Exiting ai-pr-review gracefully.');
    return;
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !fs.existsSync(eventPath)) {
    console.error('GITHUB_EVENT_PATH is missing or invalid.');
    return;
  }

  try {
    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8')) as {
      pull_request?: { url?: string };
    };
    const pr = eventData.pull_request;

    if (!pr || !pr.url) {
      console.warn('No pull request URL found in event payload.');
      return;
    }

    const prUrl = String(pr.url);
    if (!prUrl.startsWith('https://api.github.com/repos/')) {
      console.error('Invalid PR URL.');
      return;
    }
    const githubToken = process.env.GITHUB_TOKEN;

    if (!githubToken) {
      console.warn('GITHUB_TOKEN is not set. Exiting ai-pr-review gracefully.');
      return;
    }

    // Fetch PR diff directly from GitHub API using curl

    console.info('Fetching PR diff from GitHub API...');
    const diffResponse = await fetch(prUrl, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github.v3.diff',
      },
    });

    if (!diffResponse.ok) {
      console.warn('Failed to fetch diff: ', diffResponse.statusText);
      fs.writeFileSync('pr-comment.txt', 'The pull request diff could not be retrieved.');
      return;
    }

    const diffText = await diffResponse.text();


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
    console.error(
      'Error during AI PR review processing:',
      error instanceof Error ? error.message : String(error),
    );
    process.exitCode = 1;
  }
}

void reviewPR();
