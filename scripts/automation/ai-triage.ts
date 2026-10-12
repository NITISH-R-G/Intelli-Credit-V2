import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';

async function triage() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    process.stderr.write('GEMINI_API_KEY is required\n');
    process.exit(1);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    process.stderr.write('GITHUB_EVENT_PATH is required\n');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });

  const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));

  if (!eventData.issue) {
    process.stderr.write('No issue data found in event payload\n');
    process.exit(0);
  }

  const issueTitle = eventData.issue.title || '';
  const issueBody = eventData.issue.body || '';

  const prompt = `
You are an AI maintainer for the Intelli-Credit terminal open-source project.
A new issue has been opened.
Analyze the issue and provide a welcoming, helpful response.

Issue Title: ${issueTitle}
Issue Body: ${issueBody}

Your response should:
1. Greet the contributor.
2. Acknowledge the issue (is it a bug, feature request, question?).
3. Suggest initial steps for them or others to fix it or gather more information.
4. Mention that you are an AI assistant and a human maintainer will review it soon.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    if (response.text) {
      fs.writeFileSync('triage-comment.txt', response.text);
      process.stdout.write('Triage comment generated successfully.\n');
    } else {
      process.stderr.write('No text returned from Gemini.\n');
    }
  } catch (error) {
    process.stderr.write(`Failed to generate triage comment: ${error}\n`);
    process.exit(1);
  }
}

await triage().catch(() => process.exit(1));
