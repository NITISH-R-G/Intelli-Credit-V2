import fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function reviewPR(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('GEMINI_API_KEY missing, exiting gracefully.');
    process.exit(0);
  }

  if (!fs.existsSync('pr-diff.txt')) {
    console.info('pr-diff.txt not found, skipping PR review.');
    return;
  }

  const diffContent = fs.readFileSync('pr-diff.txt', 'utf-8');
  if (!diffContent.trim()) {
    console.info('Empty diff, skipping PR review.');
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Act as a senior staff engineer and review this pull request diff. Look for:
- Security vulnerabilities
- Performance regressions
- Code quality (TypeScript best practices)
- Architectural concerns
- Missing tests or documentation

Provide actionable feedback in markdown format. Be constructive and specific.

Diff:
${diffContent.substring(0, 50000)} // Truncating to avoid massive prompts if huge
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    if (response.text) {
      fs.writeFileSync('pr-comment.txt', response.text as string);
      console.info('PR review written to pr-comment.txt');
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

void reviewPR();
