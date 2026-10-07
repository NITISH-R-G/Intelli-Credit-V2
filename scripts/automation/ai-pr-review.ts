import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function reviewPR() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    process.exit(0);
  }

  const diffPath = 'pr-diff.txt';
  if (!fs.existsSync(diffPath)) {
    process.exit(0);
  }

  const diffContent = fs.readFileSync(diffPath, 'utf8');

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Please review the following git diff for a pull request. Provide constructive feedback, identify potential bugs or issues, and suggest improvements. Return the output as a clean markdown comment:

\`\`\`diff
${diffContent}
\`\`\`
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  });

  const reviewComment = response.text || 'No review generated.';
  fs.writeFileSync('pr-comment.txt', reviewComment);
}

await reviewPR().catch(() => process.exit(1));
