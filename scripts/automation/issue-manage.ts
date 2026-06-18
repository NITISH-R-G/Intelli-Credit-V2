import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

const main = async () => {
  console.info('Running AI Issue Manager...');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Skipping real AI issue management.');
    fs.writeFileSync(
      path.resolve(process.cwd(), 'ai-issue-response.md'),
      'GEMINI_API_KEY is not set. Skipping real AI issue management.',
    );
    return;
  }

  const issueTitle = process.env.ISSUE_TITLE || 'Unknown Issue';
  const issueBody = process.env.ISSUE_BODY || 'No body provided.';

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert AI repository maintainer.
Analyze the following GitHub issue and provide a helpful, constructive response.
Identify if it is a bug report, feature request, or question.
Suggest potential solutions, workarounds, or next steps.

Issue Title: ${issueTitle}
Issue Body:
${issueBody}

Your response will be posted directly as a comment on the issue. Be polite and professional.
`;

  let responseText = '';
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    responseText =
      response.text || 'Thank you for your issue! A maintainer will review it shortly.';
  } catch (error) {
    console.error('AI Generation failed:', error);
    responseText = 'Thank you for your issue! (AI response generation failed).';
  }

  // Determine label
  let suggestedLabel = 'triage';
  const lowerResp = responseText.toLowerCase();
  if (lowerResp.includes('bug report')) suggestedLabel = 'bug';
  else if (lowerResp.includes('feature request')) suggestedLabel = 'enhancement';
  else if (lowerResp.includes('question')) suggestedLabel = 'question';

  fs.writeFileSync(path.resolve(process.cwd(), 'ai-issue-response.md'), responseText);
  fs.writeFileSync(path.resolve(process.cwd(), 'ai-issue-label.txt'), suggestedLabel);

  console.info('AI Issue response generated successfully.');
};

main().catch(console.error);
