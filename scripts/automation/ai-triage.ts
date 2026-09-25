import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function triage(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Exiting ai-triage gracefully.');
    return;
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !fs.existsSync(eventPath)) {
    console.error('GITHUB_EVENT_PATH is missing or invalid.');
    return;
  }

  try {
    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8')) as {
      issue?: { title?: string; body?: string };
    };
    const issue = eventData.issue;

    if (!issue) {
      console.warn('No issue found in event payload.');
      return;
    }

    const issueTitle = String(issue.title);
    const issueBody = String(issue.body);

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a senior AI maintainer for the Intelli-Credit-V2 repository.
Please review the following issue.
Title: ${issueTitle}
Body: ${issueBody || 'No description provided.'}

Provide a brief, actionable response welcoming the contributor, summarizing the issue, categorizing it (bug, enhancement, question), and suggesting next steps or an automated fix approach. Output the response in Markdown format.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const aiResponse = response.text || 'Unable to generate response at this time.';

    fs.writeFileSync('triage-comment.txt', aiResponse);
    console.info('Successfully generated triage comment.');
  } catch (error) {
    console.error(
      'Error during AI triage processing:',
      error instanceof Error ? error.message : String(error),
    );
    process.exitCode = 1;
  }
}

void triage();
