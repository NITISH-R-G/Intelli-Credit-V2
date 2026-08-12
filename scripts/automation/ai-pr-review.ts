import fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function reviewPR(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Skipping PR review.');
    process.exit(0);
  }

  let prDiff = '';
  try {
    if (fs.existsSync('pr-diff.txt')) {
      prDiff = fs.readFileSync('pr-diff.txt', 'utf-8');
    } else {
      console.warn('pr-diff.txt not found. Cannot perform code review.');
      process.exit(0);
    }
  } catch (error) {
    console.error('Failed to read pr-diff.txt:', error);
    process.exit(1);
  }

  if (!prDiff || prDiff.trim() === '') {
    console.warn('PR diff is empty. Skipping review.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
    You are an AI code reviewer (Senior Staff Engineer) for the Intelli-Credit open-source project.
    Review the following pull request diff. Look for:
    - Code quality and maintainability
    - Potential bugs or edge cases
    - Performance implications
    - Security concerns
    - Missing tests or documentation

    Provide constructive feedback and actionable recommendations.

    PR Diff:
    \`\`\`diff
    ${prDiff}
    \`\`\`
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const aiResponse = response.text;
    if (aiResponse) {
      fs.writeFileSync('pr-comment.txt', aiResponse);
      console.info('PR review comment generated successfully.');
    }
  } catch (error) {
    console.error('Error generating AI review:', error);
    process.exit(1);
  }
}

void reviewPR();
