import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function runTriage() {
  console.info('Starting AI issue triage...');

  const issueNumber = process.env.ISSUE_NUMBER;
  const eventPath = process.env.GITHUB_EVENT_PATH;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!issueNumber) {
    console.error('No ISSUE_NUMBER provided via environment variable.');
    process.exit(1);
  }

  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH not provided.');
    process.exit(1);
  }

  if (!apiKey) {
    console.error('GEMINI_API_KEY environment variable is missing.');
    process.exit(1);
  }

  console.info(`Triaging issue #${issueNumber}`);

  try {
    const eventPayload = JSON.parse(readFileSync(eventPath, 'utf8'));
    const issue = eventPayload.issue;

    if (!issue) {
      console.info('No issue data found in event payload.');
      process.exit(0);
    }

    const issueText = `Title: ${issue.title}\nBody: ${issue.body}`;

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are an expert open-source maintainer triaging a new issue.
Here is the issue:
${issueText}

Based on this issue, output exactly ONE comma-separated list of labels that should be applied from this list: bug, enhancement, documentation, question, help wanted, good first issue, security. Do not output anything else.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const labelsText = response.text?.trim() || '';
    if (labelsText) {
      const labels = labelsText.split(',').map((l) => l.trim());
      console.info(`Determined labels: ${labels.join(', ')}`);

      // Execute gh CLI to add labels
      // In a real runner `gh` would be authenticated via GITHUB_TOKEN
      // We catch errors just in case `gh` is not set up correctly in the environment
      try {
        execFileSync('gh', ['issue', 'edit', issueNumber, '--add-label', labels.join(',')], {
          encoding: 'utf8',
        });
        console.info(`Issue #${issueNumber} successfully labeled.`);
      } catch (ghError) {
        console.error(`Failed to execute gh CLI to label issue #${issueNumber}:`, ghError);
      }
    }
  } catch (error) {
    console.error(`Failed to triage issue #${issueNumber}:`, error);
    process.exit(1);
  }
}

runTriage();
