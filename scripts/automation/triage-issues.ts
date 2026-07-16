import { GoogleGenAI } from '@google/genai';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const apiKey = process.env.GEMINI_API_KEY;

async function triageIssue() {
  const issueBody = process.env.ISSUE_BODY;
  const issueTitle = process.env.ISSUE_TITLE;

  if (!issueBody || !issueTitle) {
    console.warn('No issue body or title found, skipping triage.');
    return;
  }

  let label = 'needs-triage';

  try {
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
        Analyze the following GitHub issue and categorize it into one of these labels:
        bug, enhancement, documentation, question, good first issue, help wanted.
        Return only the label name.

        Title: ${issueTitle}
        Body: ${issueBody}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text?.trim().toLowerCase() || '';

      if (['bug', 'enhancement', 'documentation', 'question', 'good first issue', 'help wanted'].includes(text)) {
        label = text;
      }
    }
  } catch (error) {
    console.error('Error classifying issue with Gemini:', error);
  }

  console.info(`Suggested label: ${label}`);

  fs.writeFileSync('issue_label.txt', label);
}

triageIssue().catch(console.error);
