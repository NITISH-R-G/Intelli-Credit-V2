import { GoogleGenAI } from '@google/genai';
import fs from 'node:fs';

async function review() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    process.exit(0);
  }

  let diff = '';
  try {
    diff = fs.readFileSync('pr-diff.txt', 'utf8');
  } catch (err) {
    console.error('Failed to read pr-diff.txt', err);
    process.exit(1);
  }

  if (!diff.trim()) {
    console.info('Empty diff, skipping review.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are a strict but helpful senior software engineer reviewing a pull request.
Here is the git diff:
\`\`\`diff
${diff}
\`\`\`
Provide a concise code review. Point out any security vulnerabilities, performance issues, logic bugs, or violations of common best practices (like missing types or missing explicit 'type' on buttons in React). If the code looks great, say so.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    const reply = response.text || 'LGTM!';
    fs.writeFileSync('pr-comment.txt', reply);
    console.info('PR review generated successfully.');
  } catch (error) {
    console.error('Failed to generate PR review:', error);
    process.exit(1);
  }
}

void review();
