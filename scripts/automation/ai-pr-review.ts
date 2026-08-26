import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function reviewPR(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Skipping PR review.');
    process.exit(0);
  }

  let diffText = '';
  try {
    diffText = fs.readFileSync('pr-diff.txt', 'utf-8');
  } catch (error) {
    console.error('Could not read pr-diff.txt:', error);
    process.exit(1);
  }

  if (!diffText.trim()) {
    console.info('No diff found to review.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are the AI maintainer for the Intelli-Credit repository.
Review the following pull request diff. Look for:
- Code quality issues
- Security concerns
- Performance improvements
- Adherence to best practices

Provide actionable feedback in Markdown format.

Diff:
${diffText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    const text = response.text || '';
    fs.writeFileSync('pr-comment.txt', text);
    console.info('Successfully generated PR review.');
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    process.exit(1);
  }
}

void reviewPR();
