import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';

async function triage(): Promise<void> {
  const issueTitle = process.env.ISSUE_TITLE;
  const issueBody = process.env.ISSUE_BODY;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!issueTitle || !apiKey) {
    process.stderr.write('Missing ISSUE_TITLE or GEMINI_API_KEY.\n');
    process.exit(1);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a senior staff engineer AI triage agent.
Please triage this issue by analyzing the title and body.

Title: ${issueTitle}
Body: ${issueBody || '(no body provided)'}

Provide:
1. A polite response acknowledging the issue.
2. A brief analysis of the problem.
3. Suggested next steps.
4. Appropriate labels (e.g., bug, enhancement, help wanted, etc.) as a comma-separated list at the very end in a line starting with "Labels: ".
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text;
    if (text) {
      fs.writeFileSync('triage-comment.txt', text, 'utf-8');
      process.stdout.write('Triage generated successfully.\n');
    } else {
      process.stderr.write('No text received from Gemini API.\n');
      process.exit(1);
    }
  } catch {
    process.stderr.write('Error generating content.\n');
    process.exit(1);
  }
}

await triage().catch(() => process.exit(1));
