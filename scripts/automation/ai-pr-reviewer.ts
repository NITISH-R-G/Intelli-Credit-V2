import fs from 'node:fs';
import path from 'node:path';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.info('GEMINI_API_KEY is missing. Skipping AI PR review.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

async function reviewPR(): Promise<void> {
  try {
    const diffPath = 'pr-diff.txt';
    if (!fs.existsSync(diffPath)) {
      console.warn(`Diff file ${diffPath} not found. Skipping review.`);
      return;
    }

    const diffContent = fs.readFileSync(diffPath, 'utf8');
    if (!diffContent.trim()) {
      console.info('Empty diff. Nothing to review.');
      return;
    }

    let prInfo = '';
    const eventPath = process.env.GITHUB_EVENT_PATH;
    if (eventPath && fs.existsSync(eventPath)) {
      const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
      const prTitle = eventData.pull_request?.title || '';
      const prBody = eventData.pull_request?.body || '';
      const prAuthor = eventData.pull_request?.user?.login || '';
      prInfo = `PR Author: @${prAuthor}\nTitle: ${prTitle}\nDescription: ${prBody}\n`;
    }

    console.info('Analyzing PR diff...');

    const prompt = `
You are an expert AI repository maintainer for "Intelli-Credit Terminal", an AI-powered corporate credit appraisal system using Google Gemini.
Please perform a code review on the following Pull Request.

${prInfo}

Here is the git diff of the changes:
\`\`\`diff
${diffContent.substring(0, 100000)} // Truncating if extremely large
\`\`\`

Provide a comprehensive code review. Include:
1. A summary of the changes.
2. Code quality and maintainability suggestions.
3. Security or performance concerns (if any).
4. Whether the PR seems safe to merge.

Output ONLY the raw markdown text for the GitHub comment. Do not use markdown code blocks to wrap the entire response.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const comment = response.text || '';
    if (comment) {
      fs.writeFileSync('pr-comment.txt', comment, 'utf8');
      console.info('PR review comment generated successfully.');
    } else {
      console.warn('AI generated an empty response.');
    }
  } catch (error) {
    console.error('Error during PR review:', error);
    process.exit(1);
  }
}

void reviewPR();
