import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';
import { execFileSync } from 'node:child_process';

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Skipping AI Triage.');
    process.exit(0);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH not found.');
    process.exit(1);
  }

  try {
    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf-8')) as Record<string, unknown>;
    const issue = eventData.issue as Record<string, unknown> | undefined;

    if (!issue) {
      console.warn('No issue found in event payload.');
      process.exit(0);
    }

    const issueTitle = issue.title as string | undefined;
    const issueBody = issue.body as string | undefined;
    const issueNumber = issue.number as number | undefined;

    if (!issueTitle) {
      console.warn('Issue title is missing.');
      process.exit(0);
    }

    const prompt = `You are an expert open-source maintainer. Please review the following issue.
    Provide a friendly, helpful triage response.
    Additionally, suggest 1 to 3 GitHub labels that fit this issue.
    Format the labels as a comma-separated list on a single line starting with "LABELS: "

    Issue Title: ${issueTitle}
    Issue Body: ${issueBody ?? 'No description provided.'}
    `;

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const aiText = response.text;
    if (aiText) {
      fs.writeFileSync('triage-comment.txt', aiText);
      console.info('Triage comment written to triage-comment.txt');

      const labelsMatch = aiText.match(/LABELS:\s*(.+)/i);
      if (labelsMatch && labelsMatch[1] && issueNumber) {
        const labels = labelsMatch[1]
          .split(',')
          .map((l) => l.trim().replace(/["']/g, ''))
          .filter((l) => l);
        if (labels.length > 0) {
          try {
            const token = process.env.GITHUB_TOKEN;
            if (token) {
              const repo = process.env.GITHUB_REPOSITORY;
              console.info(`Applying labels: ${labels.join(', ')}`);
              execFileSync('curl', [
                '-s',
                '-X',
                'POST',
                '-H',
                'Accept: application/vnd.github.v3+json',
                '-H',
                `Authorization: token ${token}`,
                `https://api.github.com/repos/${repo}/issues/${issueNumber}/labels`,
                '-d',
                JSON.stringify({ labels }),
              ]);
            }
          } catch {
            console.error('Failed to apply labels.');
          }
        }
      }
    }
  } catch (err) {
    console.error('Error during AI triage:', err);
    process.exit(1);
  }
}

void main();
