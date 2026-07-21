import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('GEMINI_API_KEY not found. Skipping AI Triage.');
  process.exit(0);
}

// Read event payload directly to safely get issue title and body without environment variable issues
const eventPath = process.env.GITHUB_EVENT_PATH;
let issueTitle = 'No issue title provided.';
let issueBody = 'No issue body provided.';

if (eventPath && fs.existsSync(eventPath)) {
  try {
    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
    if (eventData && eventData.issue) {
      issueTitle = eventData.issue.title || issueTitle;
      issueBody = eventData.issue.body || issueBody;
    }
  } catch (error) {
    console.error('Error reading or parsing GITHUB_EVENT_PATH:', error);
  }
} else {
  // Fallback just in case
  issueTitle = process.env.ISSUE_TITLE || issueTitle;
  issueBody = process.env.ISSUE_BODY || issueBody;
}

const ai = new GoogleGenAI({ apiKey });

async function triage() {
  try {
    const prompt = `You are an AI Issue Triager acting as a senior open source maintainer.
Analyze the following GitHub Issue:

Title: ${issueTitle}
Body:
${issueBody}

Provide a triage response. Be polite, welcome the user, categorize the issue (e.g., bug, feature, documentation, question), suggest immediate next steps, and mention that human maintainers will review it shortly. Output only the Markdown content for the comment.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const comment =
      response.text || 'Thank you for opening this issue! A maintainer will review it shortly.';

    fs.writeFileSync('triage-comment.txt', comment);
    console.info('Triage comment successfully written to triage-comment.txt');
  } catch (error) {
    console.error('Failed to triage issue:', error);
    process.exit(1);
  }
}

triage();
