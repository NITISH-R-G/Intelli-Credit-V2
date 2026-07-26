import fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function reviewPR(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('GEMINI_API_KEY not found. Skipping PR review to allow external PRs/forks to pass.');
    process.exit(0);
  }

  const diffPath = 'pr-diff.txt';
  if (!fs.existsSync(diffPath)) {
    console.error('pr-diff.txt not found. Exiting.');
    process.exit(1);
  }

  const diffContent = fs.readFileSync(diffPath, 'utf8');
  if (!diffContent.trim()) {
    console.info('Empty diff, nothing to review.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are an expert AI Maintainer reviewing a Pull Request.
Below is the git diff for the changes:

${diffContent}

Please review the code for:
- Security vulnerabilities
- Performance regressions
- Code quality (linting, best practices)
- Logic errors

Provide a constructive, detailed review in markdown format. If everything looks perfect, state that the changes look good.`;

  try {
    console.info('Generating PR review via Gemini...');
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    if (response.text) {
      fs.writeFileSync('pr-comment.txt', response.text, 'utf8');
      console.info('PR review comment written to pr-comment.txt.');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    process.exit(1);
  }
}

void reviewPR();
