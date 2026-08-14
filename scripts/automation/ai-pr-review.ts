import fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function review(): Promise<void> {
    if (!process.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY not found. Skipping AI PR review.');
        process.exit(0);
    }

    if (!fs.existsSync('pr-diff.txt')) {
        console.error('pr-diff.txt not found.');
        process.exit(1);
    }

    const diff = fs.readFileSync('pr-diff.txt', 'utf8');

    if (!diff.trim()) {
        console.warn('Empty diff. Nothing to review.');
        process.exit(0);
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: `You are a senior staff engineer AI reviewer for the Intelli-Credit Terminal repository.
Please review the following git diff for a pull request. Provide constructive feedback, point out any bugs or security issues, suggest performance improvements, and assess adherence to best practices (like using native node functions, explicit typing, etc).

Diff:
${diff}`
        });

        if (response.text) {
            fs.writeFileSync('pr-comment.txt', response.text);
            console.info('PR review comment generated successfully.');
        }
    } catch (err) {
        console.error('Error generating AI response:', err);
        process.exit(1);
    }
}

review().catch((err) => { console.error(err); process.exit(1); });
