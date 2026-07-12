import { GoogleGenAI } from '@google/genai';
import { execFileSync } from 'node:child_process';

async function main() {
  console.info('Starting AI issue triage...');

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is missing.');
    console.error('Fatal Error');
    process.exitCode = 1;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const issueNumber = process.env.ISSUE_NUMBER;
  const issueTitle = process.env.ISSUE_TITLE || '';
  const issueBody = process.env.ISSUE_BODY || '';

  if (!issueNumber || !issueTitle) {
    console.warn('Issue number or title missing. Skipping triage.');
    return;
  }

  const prompt = `
    You are an expert AI maintainer for an open-source repository.
    Review the following issue and suggest labels (e.g., bug, enhancement, documentation) and an initial response.

    Issue Title: ${issueTitle}
    Issue Body: ${issueBody}

    Return exactly a JSON object with 'labels' (array of strings) and 'comment' (string).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const resultText = response.text || '{}';
    const result = JSON.parse(resultText);

    if (result.labels && Array.isArray(result.labels) && result.labels.length > 0) {
      console.info(`Applying labels: ${result.labels.join(', ')}`);
      execFileSync('gh', ['issue', 'edit', issueNumber, '--add-label', result.labels.join(',')], {
        stdio: 'inherit',
      });
    }

    if (result.comment) {
      console.info('Adding comment...');
      execFileSync('gh', ['issue', 'comment', issueNumber, '--body', result.comment], {
        stdio: 'inherit',
      });
    }

    console.info('Triage complete.');
  } catch (error) {
    console.error('Failed to run AI triage:', error);
    console.error('Fatal Error');
    process.exitCode = 1;
  }
}

main();
