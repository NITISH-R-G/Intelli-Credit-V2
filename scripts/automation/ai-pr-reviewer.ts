import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';

async function review() {
  if (!process.env.GEMINI_API_KEY) {
    console.info('GEMINI_API_KEY not found. Skipping AI PR review gracefully.');
    process.exit(0);
  }

  if (!fs.existsSync('pr-diff.txt')) {
    console.warn('pr-diff.txt not found. Cannot perform PR review.');
    process.exit(0);
  }

  const diff = fs.readFileSync('pr-diff.txt', 'utf-8');

  if (!diff.trim()) {
    console.info('Empty diff, nothing to review.');
    fs.writeFileSync(
      'pr-comment.txt',
      'The pull request diff is empty. Nothing to review.',
      'utf-8',
    );
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `You are a senior staff engineer AI acting as a PR Reviewer for the Intelli-Credit project.
Review the following git diff. Identify potential bugs, security vulnerabilities, performance issues, readability improvements, or deviations from best practices.
Provide a clear, structured code review with actionable feedback.

Diff:
${diff}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    const reply = response.text;
    fs.writeFileSync('pr-comment.txt', reply, 'utf-8');
    console.info('Successfully generated PR review comment.');
  } catch (error) {
    console.error('Error calling Gemini API for PR review:', error);
    process.exit(1);
  }
}

void review();
