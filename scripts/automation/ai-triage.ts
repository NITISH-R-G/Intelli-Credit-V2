import fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function triage(): Promise<void> {
    if (!process.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY not found. Skipping AI triage.');
        process.exit(0);
    }

    const eventPath = process.env.GITHUB_EVENT_PATH;
    if (!eventPath || !fs.existsSync(eventPath)) {
        console.error('GITHUB_EVENT_PATH not found.');
        process.exit(1);
    }

    const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
    const issue = event.issue;

    if (!issue) {
        console.warn('No issue found in event payload.');
        process.exit(0);
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: `You are an AI maintainer for the Intelli-Credit Terminal repository.
Please review the following new issue, identify its category (Bug, Feature, Question, etc.), provide initial guidance or troubleshooting steps, and suggest labels. Format as a helpful comment to the user.

Title: ${issue.title}
Body: ${issue.body}`
        });

        if (response.text) {
            fs.writeFileSync('triage-comment.txt', response.text);
            console.info('Triage comment generated successfully.');
        }
    } catch (err) {
        console.error('Error generating AI response:', err);
        process.exit(1);
    }
}

triage().catch((err) => { console.error(err); process.exit(1); });
