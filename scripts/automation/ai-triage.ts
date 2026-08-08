import { GoogleGenAI } from '@google/genai';
import fs from 'node:fs';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('No GEMINI_API_KEY found, exiting gracefully.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

async function triage() {
  try {
    const eventPath = process.env.GITHUB_EVENT_PATH;
    if (!eventPath) {
      console.error('GITHUB_EVENT_PATH not set, not running inside GitHub Actions context');
      process.exit(0);
    }

    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));

    if (eventData.action !== 'opened') {
      process.exit(0);
    }

    const title = eventData.issue?.title || eventData.pull_request?.title || '';
    const body = eventData.issue?.body || eventData.pull_request?.body || '';
    const type = eventData.issue ? 'issue' : 'pull request';

    const prompt = `
        You are a highly capable AI assistant helping to triage a new ${type} in a software repository.
        Title: ${title}
        Body: ${body}

        Please provide a short, helpful response to acknowledge the user.
        Suggest any relevant labels.
        If it's an issue and seems like a bug, ask for steps to reproduce.
        If it's a feature request, ask about the use case.
        Be polite and professional.
        `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const reply =
      response.text || 'Thank you for your submission. A maintainer will review it shortly.';

    fs.writeFileSync('triage-comment.txt', reply, 'utf-8');
    console.info('Successfully generated triage comment.');
  } catch (e) {
    console.error('Error during triage:', e);
    process.exit(1);
  }
}

void triage();
