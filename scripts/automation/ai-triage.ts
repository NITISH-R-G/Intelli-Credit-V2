import fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function triage(): Promise<void> {
    try {
        console.info('Starting AI Triage...');
        const eventPath = process.env.GITHUB_EVENT_PATH;
        if (!eventPath) {
            console.warn('GITHUB_EVENT_PATH not set. Skipping triage.');
            return;
        }

        const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
        const issueTitle = eventData.issue?.title || '';
        const issueBody = eventData.issue?.body || '';

        console.info(`Triaging issue: ${issueTitle}`);

        fs.mkdirSync('docs/history', { recursive: true });
        fs.mkdirSync('docs/architecture', { recursive: true });

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn('GEMINI_API_KEY not set. Exiting gracefully.');
            process.exit(0);
        }

        const ai = new GoogleGenAI({ apiKey });

        const prompt = `You are an AI repository maintainer. Please review the following issue and provide a helpful, automated response. Triage it, suggest next steps, or ask for clarification if needed.

Issue Title: ${issueTitle}
Issue Body: ${issueBody}`;

        const aiResponse = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
        });

        const responseText = aiResponse.text || "Thank you for the issue! We will look into it.";
        const finalResponse = `${responseText}\n\n*This is an automated response from the AI Issue Triager.*`;

        fs.writeFileSync('triage-comment.txt', finalResponse, 'utf8');
        console.info('AI Triage completed.');
    } catch (err) {
        console.error('Error during AI triage:', err);
    }
}

void triage();