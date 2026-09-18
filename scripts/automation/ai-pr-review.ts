import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';

async function reviewPR(): Promise<void> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. Exiting ai-pr-review gracefully.');
      process.exit(0);
    }

    let diff = '';
    if (fs.existsSync('pr-diff.txt')) {
      diff = fs.readFileSync('pr-diff.txt', 'utf8');
    } else {
      console.warn('No pr-diff.txt found. Exiting.');
      return;
    }

    if (!diff) {
      console.warn('Empty diff. Exiting.');
      return;
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are a senior staff engineer reviewing a Pull Request.
Here is the git diff:
${diff.substring(0, 50000)}

Please review the code changes. Look for:
1. Bugs or logic errors
2. Security vulnerabilities
3. Performance issues
4. Readability and maintainability

Provide a concise, constructive review. If the code looks good, say so.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text;
    if (text) {
      fs.writeFileSync('pr-comment.txt', text, 'utf8');
      console.info('Successfully generated PR review comment.');
    }
  } catch (error) {
    console.error('Error during AI PR review:', error);
  }
}

void reviewPR();
