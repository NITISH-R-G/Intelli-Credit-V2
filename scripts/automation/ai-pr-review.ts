import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function reviewPR(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('GEMINI_API_KEY not found. Skipping PR review.');
    process.exitCode = 0;
  }

  let diffText = '';
  try {
    if (fs.existsSync('pr-diff.txt')) {
      diffText = fs.readFileSync('pr-diff.txt', 'utf8');
    }
  } catch (error) {
    console.error('Failed to read pr-diff.txt', error);
  }

  if (!diffText || diffText.trim().length === 0) {
    console.info('No diff found or diff is empty.');
    process.exitCode = 0;
  }

  let eventData: Record<string, unknown> | null = null;
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (eventPath && fs.existsSync(eventPath)) {
    try {
      const rawData = fs.readFileSync(eventPath, 'utf8');
      eventData = JSON.parse(rawData);
    } catch (error) {
      console.error('Failed to read GITHUB_EVENT_PATH', error);
    }
  }

  const pr = eventData?.pull_request as Record<string, unknown> | undefined;
  const title = (pr?.title as string) || '';
  const body = (pr?.body as string) || '';

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert open-source maintainer and senior staff engineer reviewing a Pull Request for the Intelli-Credit repository.
Your goal is to review the code changes and provide actionable, constructive feedback.

Pull Request Title: ${title}
Pull Request Body: ${body}

Here is the diff:
\`\`\`diff
${diffText.slice(0, 10000)} // Truncating to a//massive tokens
\`\`\`

Please provide a structured PR review:
1. Summary of changes (what this PR does).
2. Potential issues, bugs, or security vulnerabilities.
3. Code quality and architecture feedback.
4. Final recommendation (Approve, Request Changes, or Comment).
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    const resultText = response.text;

    if (resultText) {
      fs.writeFileSync('pr-comment.txt', resultText, 'utf8');
      console.info('Successfully wrote PR review comment.');
    }
  } catch (error) {
    console.error('Failed to generate PR review via Gemini:', error);
    process.exitCode = 1;
  }
}

reviewPR().catch(() => {
  process.exitCode = 1;
});
