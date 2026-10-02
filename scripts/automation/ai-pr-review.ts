import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';

async function reviewPR() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is missing');
    process.exit(0);
  }

  try {
    if (!fs.existsSync('pr-diff.txt')) {
      console.info('No pr-diff.txt found, skipping review.');
      process.exit(0);
    }

    const diff = fs.readFileSync('pr-diff.txt', 'utf8');
    if (!diff.trim()) {
      console.info('Diff is empty, skipping review.');
      process.exit(0);
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are an expert AI code reviewer. Please review the following git diff and provide constructive feedback. Focus on security, performance, best practices, and bugs. If the code looks good, explicitly state that. Respond in markdown directly without conversational filler.

Diff:
\`\`\`diff
${diff.slice(0, 50000)} // Truncating to avoid context window issues
\`\`\`
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const comment = response.text;
    if (comment) {
      fs.writeFileSync('pr-comment.txt', comment);
      console.info('PR review generated successfully.');
    }
  } catch {
    console.error('Error during AI PR review.');
    process.exit(0);
  }
}

void reviewPR();
