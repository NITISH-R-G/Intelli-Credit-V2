import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';

async function reviewPR(): Promise<void> {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not set. Exiting gracefully.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !fs.existsSync(eventPath)) {
    console.error('GITHUB_EVENT_PATH not found or file does not exist.');
    process.exit(1);
  }

  try {
    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));

    if (!eventData.pull_request) {
      console.info('Not a pull request event. Exiting.');
      process.exit(0);
    }

    const prTitle = eventData.pull_request.title || '';
    const prBody = eventData.pull_request.body || '';

    let prDiff = '';
    if (fs.existsSync('pr-diff.txt')) {
      prDiff = fs.readFileSync('pr-diff.txt', 'utf8');
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `
You are an expert Senior Staff Engineer reviewing a Pull Request for a Node.js/React application.
Please review the PR details and diff, providing constructive feedback.
Identify any potential bugs, security issues, performance concerns, or code smells.

PR Title: ${prTitle}
PR Description: ${prBody}

Code Diff:
${prDiff}

Provide a comprehensive review. If the code looks good, state that clearly.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const prComment =
      response.text || 'Thank you for your pull request. A maintainer will review it soon.';

    // Write the output to pr-comment.txt
    fs.writeFileSync('pr-comment.txt', prComment, 'utf-8');
    console.info('Successfully generated PR review comment.');
  } catch (error) {
    console.error('Error during PR review:', error);
    process.exit(1);
  }
}

void reviewPR();
