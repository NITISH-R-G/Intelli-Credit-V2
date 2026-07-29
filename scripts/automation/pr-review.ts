import * as fs from 'fs';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.info('GEMINI_API_KEY is not set. Exiting ai pr review.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

async function review() {
  try {
    if (!fs.existsSync('pr-diff.txt')) {
      console.warn('pr-diff.txt not found.');
      return;
    }

    const diffContent = fs.readFileSync('pr-diff.txt', 'utf8');
    if (!diffContent.trim()) {
      console.info('No diff found.');
      return;
    }

    const prompt = `You are an AI PR reviewer for the Intelli-Credit Terminal repository.
Review the following git diff and provide constructive feedback on the code changes.
Suggest any improvements or note any potential issues.

Diff:
${diffContent}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const reviewFeedback = response.text || 'Looks good!';
    fs.writeFileSync('pr-comment.txt', reviewFeedback);
    console.info('PR review comment generated successfully.');
  } catch (error) {
    console.error('Error in ai pr review:', error);
  }
}

void review();
