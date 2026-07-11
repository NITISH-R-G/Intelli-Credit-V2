import { GoogleGenAI } from '@google/genai';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

async function main() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('No GITHUB_EVENT_PATH provided.');
    process.exit(1);
  }

  const eventData = JSON.parse(readFileSync(eventPath, 'utf8'));
  const issue = eventData.issue;

  if (!issue) {
    console.info('Not an issue event. Exiting.');
    return;
  }

  const title = issue.title || '';
  const body = issue.body || '';

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('No GEMINI_API_KEY found, skipping AI triage.');
    return;
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = `
You are an AI issue triager for the Intelli-Credit Terminal repository.
Based on the following issue title and body, suggest 1 to 3 relevant labels from this list:
[bug, enhancement, documentation, good first issue, help wanted, question]
Return ONLY a comma-separated list of labels.

Title: ${title}
Body: ${body}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const output = response.text?.trim() || '';
    const suggestedLabels = output
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean);

    console.info(`Suggested labels: ${suggestedLabels.join(', ')}`);

    if (suggestedLabels.length > 0) {
      const issueNumber = issue.number.toString();
      console.info(`Adding labels to issue #${issueNumber}`);

      const args = ['issue', 'edit', issueNumber, '--add-label', suggestedLabels.join(',')];
      execFileSync('gh', args, { stdio: 'inherit' });
    }
  } catch (error) {
    console.error('Error during AI triage:', error);
  }
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
