import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const main = async () => {
  console.log('Running AI Issue Triager...');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Skipping real AI issue triage.');
    fs.writeFileSync(
      path.resolve(process.cwd(), 'ai-issue-triage-output.md'),
      'GEMINI_API_KEY is not set. Skipping real AI issue triage.',
    );
    return;
  }

  const issueTitle = process.env.ISSUE_TITLE || 'Unknown Issue';
  const issueBody = process.env.ISSUE_BODY || 'No description provided.';
  const issueNumber = process.env.ISSUE_NUMBER || 'Unknown';
  const issueAuthor = process.env.ISSUE_AUTHOR || 'Unknown Author';

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert AI repository manager. Please analyze the following GitHub issue and provide a triage report.
The triage report should include:
- A brief summary of the issue.
- Recommended labels (e.g., bug, enhancement, documentation, question).
- Recommended priority (Low, Medium, High, Critical).
- Next steps for a contributor or maintainer to take.

Issue #${issueNumber}
Title: ${issueTitle}
Author: ${issueAuthor}
Body:
${issueBody}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const outputText = response.text || 'No content generated.';

    fs.writeFileSync(
      path.resolve(process.cwd(), 'ai-issue-triage-output.md'),
      `## AI Issue Triage Report\n\n${outputText}`,
    );
    console.log('AI Issue Triage Report generated successfully.');
  } catch (error) {
    console.error('Error generating AI issue triage:', error);
    process.exit(1);
  }
};

main();
