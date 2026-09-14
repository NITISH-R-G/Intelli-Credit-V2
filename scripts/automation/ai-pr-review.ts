import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function reviewPR() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Skipping PR review.');
    process.exit(0);
  }

  if (!fs.existsSync('pr-diff.txt')) {
    console.error('pr-diff.txt not found. Cannot review PR.');
    process.exit(1);
  }

  const prDiff = fs.readFileSync('pr-diff.txt', 'utf-8');

  let prContext = '';
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (eventPath && fs.existsSync(eventPath)) {
    const eventPayload = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));
    const pr = eventPayload.pull_request;
    if (pr) {
      prContext = `PR Title: ${pr.title}\nPR Description: ${pr.body || 'No description provided.'}\n\n`;
    }
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = `You are a senior staff engineer acting as an AI maintainer.
Please review the following pull request diff.
${prContext}
Provide a constructive, detailed code review. Include:
1. A summary of the changes.
2. Positive feedback on good practices.
3. Specific areas for improvement, catching potential bugs, security issues, or performance regressions.
4. Actionable recommendations.
Be polite and professional.

Diff:
${prDiff}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const aiResponse =
      response.text || 'Thank you for your PR. A maintainer will review it shortly.';

    fs.writeFileSync('pr-comment.txt', aiResponse);
    console.info('PR review comment generated successfully.');
  } catch (error) {
    console.error('Error generating PR review comment:', error);
    process.exit(1);
  }
}

void reviewPR();
