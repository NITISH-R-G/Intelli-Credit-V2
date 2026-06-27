import { GoogleGenAI } from '@google/genai';
import { readFileSync, writeFileSync } from 'node:fs';

async function main() {
  const issueTitle = process.env.ISSUE_TITLE || 'Unknown Issue';
  const issueBody = process.env.ISSUE_BODY || 'No description provided.';

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Analyze this GitHub issue and suggest labels and a brief triaging comment.
Title: ${issueTitle}
Body: ${issueBody}

Output JSON format:
{
  "labels": ["bug", "help wanted"],
  "comment": "Thanks for reporting this! We'll look into it."
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text || '{}';
    // Remove markdown json block if present
    const cleaned = text.replace(/```json\n/g, '').replace(/```\n?/g, '');
    const data = JSON.parse(cleaned);

    console.info('Suggested Labels:', data.labels);
    console.info('Suggested Comment:', data.comment);

    // Can save to a file for GitHub Actions to read
    writeFileSync('triage-result.json', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error in AI triage:', error);
    process.exit(1);
  }
}

main();
