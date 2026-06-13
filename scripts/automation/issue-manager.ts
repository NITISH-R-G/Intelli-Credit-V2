import { GoogleGenAI } from '@google/genai';

const main = async () => {
  console.log('Running AI Issue Manager...');

  const apiKey = process.env.GEMINI_API_KEY;
  const githubToken = process.env.GITHUB_TOKEN;
  const issueTitle = process.env.ISSUE_TITLE;
  const issueBody = process.env.ISSUE_BODY;
  const issueNumber = process.env.ISSUE_NUMBER;
  const repoFullName = process.env.REPO_FULL_NAME;

  if (!apiKey || !githubToken || !issueTitle || !issueNumber || !repoFullName) {
    console.warn('Missing required environment variables. Skipping issue management.');
    return;
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert AI repository manager.
Analyze the following GitHub issue and determine appropriate labels, priority, and assignees.

Issue Title: ${issueTitle}
Issue Body: ${issueBody || 'No body provided'}

Available Labels: bug, enhancement, documentation, dependencies, frontend, backend, security, technical-debt, help-wanted, good-first-issue, high-priority, medium-priority, low-priority.

Tasks:
1. Select 1-3 appropriate labels from the available list.
2. Select a priority label (high-priority, medium-priority, or low-priority).
3. If it seems like a very simple task suitable for a beginner, add "good-first-issue".
4. Determine an appropriate assignee if possible (e.g., if it's explicitly stated, otherwise leave empty).

Provide the output strictly as a JSON object with the following format:
{
  "labels": ["label1", "label2"],
  "assignees": ["username1"]
}
Only output the JSON object, nothing else.
`;

  let aiResponse = '';
  let parsedResponse: { labels?: string[]; assignees?: string[] } = {};

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    aiResponse = response.text || '{}';
    // Remove markdown code block if present
    const cleanJson = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
    parsedResponse = JSON.parse(cleanJson);
  } catch (error) {
    console.error('AI Generation or parsing failed:', error);
    console.error('Raw AI response:', aiResponse);
    return;
  }

  console.log('AI determined metadata:', parsedResponse);

  // Apply labels via GitHub API
  if (parsedResponse.labels && parsedResponse.labels.length > 0) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repoFullName}/issues/${issueNumber}/labels`,
        {
          method: 'POST',
          headers: {
            Authorization: `token ${githubToken}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ labels: parsedResponse.labels }),
        },
      );
      if (!response.ok) {
        throw new Error(`Failed to apply labels: ${response.status} ${response.statusText}`);
      }
      console.log('Successfully applied labels.');
    } catch (error) {
      console.error('Failed to apply labels:', error);
    }
  }

  // Apply assignees via GitHub API
  if (parsedResponse.assignees && parsedResponse.assignees.length > 0) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repoFullName}/issues/${issueNumber}/assignees`,
        {
          method: 'POST',
          headers: {
            Authorization: `token ${githubToken}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ assignees: parsedResponse.assignees }),
        },
      );
      if (!response.ok) {
        throw new Error(`Failed to apply assignees: ${response.status} ${response.statusText}`);
      }
      console.log('Successfully applied assignees.');
    } catch (error) {
      console.error('Failed to apply assignees:', error);
    }
  }
};

main().catch(console.error);
