import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';

async function prReview() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    process.stderr.write('GEMINI_API_KEY is required\n');
    process.exit(1);
  }

  const diffPath = 'pr-diff.txt';
  if (!fs.existsSync(diffPath)) {
    process.stderr.write('pr-diff.txt not found\n');
    process.exit(1);
  }

  const diffContent = fs.readFileSync(diffPath, 'utf-8');

  if (!diffContent.trim()) {
    process.stderr.write('PR diff is empty\n');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert AI PR Reviewer for the Intelli-Credit project.
Please review the following git diff and provide a constructive, thorough code review.
Look for bugs, security issues, performance problems, and adherence to best practices (e.g., using explicit types, handling errors, avoiding memory leaks).

Diff:
${diffContent}

Format your response as a helpful markdown review.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    if (response.text) {
      fs.writeFileSync('pr-comment.txt', response.text);
      process.stdout.write('PR review comment generated successfully.\n');
    } else {
      process.stderr.write('No text returned from Gemini.\n');
    }
  } catch (error) {
    process.stderr.write(`Failed to generate PR review: ${error}\n`);
    process.exit(1);
  }
}

await prReview().catch(() => process.exit(1));
