import * as fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { GoogleGenAI } from '@google/genai';

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Exiting gracefully.');
    process.exit(0);
  }

  const prUrl = process.env.PR_URL;
  if (!prUrl) {
    console.error('PR_URL is not set.');
    process.exit(1);
  }

  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    console.error('GITHUB_TOKEN is not set.');
    process.exit(1);
  }

  let diff = '';
  try {
    const curlArgs = [
      '-s',
      '-H',
      `Authorization: Bearer ${githubToken}`,
      '-H',
      'Accept: application/vnd.github.v3.diff',
      prUrl,
    ];
    diff = (execFileSync('curl', curlArgs) as unknown as Buffer).toString('utf-8');
  } catch (error) {
    console.error('Error fetching PR diff:', error);
    process.exit(1);
  }

  if (!diff) {
    console.info('No diff found.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Review the following pull request diff and provide actionable feedback, pointing out bugs, security issues, or improvements. Keep it concise.\n\n${diff}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    fs.writeFileSync('pr-comment.txt', response.text || 'No feedback generated.');
    console.info('Successfully generated PR review comment.');
  } catch (error) {
    console.error('Error generating PR review:', error);
    process.exit(1);
  }
}

void main();
