import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const main = async () => {
  console.log('Running AI Issue Manager...');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Skipping real issue management.');
    fs.writeFileSync(
      path.resolve(process.cwd(), 'issue-reply.md'),
      'GEMINI_API_KEY is not set. Cannot triage.',
    );
    return;
  }

  const issueTitle = process.env.ISSUE_TITLE || 'Untitled Issue';
  const issueBody = process.env.ISSUE_BODY || 'No content provided.';
  const issueAuthor = process.env.ISSUE_AUTHOR || 'Contributor';

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert AI Maintainer for an open source repository.
A new issue has been opened by @${issueAuthor}.

Issue Title: ${issueTitle}
Issue Body:
${issueBody}

Tasks:
1. Triage the issue: Determine if it is a bug, feature request, question, or documentation update.
2. Provide a friendly, helpful, and welcoming response to the contributor.
3. If it's a bug, suggest potential areas in the codebase to investigate or ask for more reproduction steps if needed.
4. If it's a feature, suggest a potential implementation approach or architectural considerations.
5. Format the response in Markdown, ready to be posted as a GitHub comment. Do not include your thought process, just the reply.
`;

  let responseText = '';
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    responseText =
      response.text ||
      'Thank you for opening this issue! A human maintainer will review it shortly.';
  } catch (error) {
    console.error('AI Generation failed:', error);
    responseText =
      'Thank you for your report! An error occurred while generating an AI response, but we will look into this manually.';
  }

  const outPath = path.resolve(process.cwd(), 'issue-reply.md');
  fs.writeFileSync(outPath, responseText);

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n### AI Issue Triage\n\n${responseText}`);
  }

  console.log('Issue reply generated successfully.');
};

main().catch(console.error);
