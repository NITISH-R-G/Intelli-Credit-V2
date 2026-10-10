import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  process.stderr.write('GEMINI_API_KEY is not set.\n');
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey });

async function review(): Promise<void> {
  const diffFile = 'pr-diff.txt';
  if (!fs.existsSync(diffFile)) {
    process.stderr.write('No diff file found.\n');
    process.exit(0);
  }

  const diffContent = fs.readFileSync(diffFile, 'utf-8');
  if (!diffContent.trim()) {
    process.stderr.write('Empty diff.\n');
    process.exit(0);
  }

  const prompt = `You are an expert AI code reviewer. Review the following PR diff.
Look for bugs, security vulnerabilities, performance issues, and adherence to clean code principles.
Provide constructive feedback.

Diff:
${diffContent}
`;

  const response = await ai.models
    .generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })
    .catch((err) => {
      process.stderr.write(`Failed to review: ${err}\n`);
      process.exit(1);
    });

  if (response && response.text) {
    fs.writeFileSync('pr-comment.txt', response.text);
    process.stdout.write('Generated PR review comment.\n');
  }
}

await review().catch((err) => {
  process.stderr.write(`Error: ${err}\n`);
  process.exit(1);
});
