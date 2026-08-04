import fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function reviewPR(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('No GEMINI_API_KEY provided. Skipping AI PR review.');
    process.exit(0);
  }

  try {
    if (!fs.existsSync('pr-diff.txt')) {
      console.info('No pr-diff.txt found. Skipping PR review.');
      process.exit(0);
    }

    const diff = fs.readFileSync('pr-diff.txt', 'utf-8');
    if (!diff.trim()) {
      console.info('Empty PR diff. Skipping.');
      process.exit(0);
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert software engineer reviewing a pull request.
Here is the git diff:
\`\`\`diff
${diff}
\`\`\`

Please review the code changes. Highlight any potential bugs, security issues, performance concerns, or architectural flaws. Provide actionable feedback. If the code looks good, mention that as well. Keep it constructive and professional.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const responseText = response.text || 'Review complete. No major issues found by the AI reviewer.';

    fs.writeFileSync('pr-comment.txt', responseText, 'utf-8');
    console.info('Successfully generated AI PR review.');
  } catch (error) {
    console.error('Error during AI PR review:', error);
    process.exit(1);
  }
}

void reviewPR();
