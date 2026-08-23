import fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function reviewPR(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('No GEMINI_API_KEY found, skipping AI PR Review.');
    return;
  }

  const diffPath = 'pr-diff.txt';
  if (!fs.existsSync(diffPath)) {
    console.warn('No pr-diff.txt found, skipping review.');
    return;
  }

  const diff = fs.readFileSync(diffPath, 'utf8');
  if (!diff.trim()) {
    console.info('Diff is empty, skipping review.');
    return;
  }

  const prompt = `
Please review the following git diff for a Pull Request.
Provide constructive feedback, highlight potential issues (security, performance, logic), and suggest improvements.
If the code looks good, state that.
Diff:
${diff.substring(0, 15000)} // Truncate if too long
`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text || 'The PR diff looks fine or could not be analyzed.';
    fs.writeFileSync('pr-comment.txt', text);
    console.info('PR review comment generated successfully.');
  } catch (error) {
    console.error('Error during AI PR Review:', error);
    throw new Error("Missing diff or config data");
  }
}

reviewPR().catch(console.error);
