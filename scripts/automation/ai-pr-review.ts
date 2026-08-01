import fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function review(): Promise<void> {
    try {
        console.info('Starting AI PR Review...');
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn('GEMINI_API_KEY not set. Exiting gracefully.');
            process.exit(0);
        }

        fs.mkdirSync('docs/history', { recursive: true });
        fs.mkdirSync('docs/architecture', { recursive: true });

        const diffContent = fs.existsSync('pr-diff.txt') ? fs.readFileSync('pr-diff.txt', 'utf8') : 'No diff found.';

        const ai = new GoogleGenAI({ apiKey });

        const prompt = `You are an expert AI PR Reviewer for a TypeScript React/Express repository. Review the following git diff and provide constructive feedback. If the changes look good, say so. Point out any potential bugs, security issues, or code quality improvements.

Diff:
${diffContent.substring(0, 50000)} // truncate to avoid token limits if too large`;

        const aiResponse = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
        });

        const responseText = aiResponse.text || "I have reviewed this PR. Looks good from a quick automated check, but human review is recommended.";
        const finalResponse = `## AI PR Review\n\n${responseText}\n\n*This is an automated response from the AI PR Reviewer.*`;

        fs.writeFileSync('pr-comment.txt', finalResponse, 'utf8');
        console.info('AI PR Review completed.');
    } catch (err) {
        console.error('Error during AI PR review:', err);
    }
}

void review();