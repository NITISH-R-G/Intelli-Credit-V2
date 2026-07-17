import { GoogleGenAI } from '@google/genai';
import { execFileSync } from 'child_process';
import * as fs from 'fs';

async function reviewPR() {
    console.info('Starting AI PR Review...');

    const apiKey = process.env.GEMINI_API_KEY;
    const baseRef = process.env.BASE_REF || 'main';

    if (!apiKey) {
        console.info('GEMINI_API_KEY environment variable is missing. Skipping AI PR Review (likely running from a fork without secrets).');
        process.exit(0);
    }

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });

        let diff = '';
        try {
            // Memory notes emphasize using origin/$BASE_REF...HEAD
            diff = execFileSync('git', ['diff', `origin/${baseRef}...HEAD`], { encoding: 'utf-8' });
        } catch (error) {
            console.warn('Could not generate git diff.', error);
            diff = 'No diff available or git command failed.';
        }

        if (diff.trim() === '' || diff.includes('No diff available')) {
            console.info('No changes detected for review.');
            fs.writeFileSync('pr-review-comment.txt', 'No changes detected or diff unavailable.');
            return;
        }

        const prompt = `Review the following git diff for a Pull Request. Focus on potential bugs, security issues, performance, and best practices. Do not use console.log in code.\n\nDiff:\n${diff}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const reviewText = response.text || 'No review generated.';
        console.info('AI PR Review Complete.');

        fs.writeFileSync('pr-review-comment.txt', reviewText);
        console.info('Saved review to pr-review-comment.txt');
    } catch (error) {
        console.error('Error during AI PR Review:', error);
        process.exit(1);
    }
}

reviewPR();
