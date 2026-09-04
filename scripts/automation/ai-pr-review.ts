import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function reviewPR(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Exiting ai-pr-review successfully.');
    process.exit(0);
  }

  let diffContent = '';
  try {
    diffContent = fs.readFileSync('pr-diff.txt', 'utf8');
  } catch (error) {
    console.warn('Could not read pr-diff.txt (possibly empty PR or error fetching diff). Exiting.');
    process.exit(0);
  }

  if (!diffContent.trim()) {
    console.info('Empty diff found, nothing to review.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
You are an expert open-source maintainer and AI code reviewer for the Intelli-Credit Terminal repository.
Please review the following git diff for a Pull Request. Focus on:
- Code quality, maintainability, and security.
- Catching bugs or logic errors.
- Adherence to best practices.
- Providing constructive, polite feedback.

Here is the diff:
\`\`\`diff
${diffContent.substring(0, 50000)} // Limiting to 50k characters to avoid token limits
\`\`\`
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    const reply = response.text || 'Code looks good! Thank you for the contribution.';

    const outputText = `### 🤖 AI PR Reviewer\n\n${reply}`;
    fs.writeFileSync('pr-comment.txt', outputText);
    console.info('Successfully generated PR review comment to pr-comment.txt');
  } catch (error) {
    console.error('Error calling Google GenAI:', error);
    process.exit(1);
  }
}

void reviewPR();
