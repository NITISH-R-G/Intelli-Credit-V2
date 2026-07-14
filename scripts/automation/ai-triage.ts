import { GoogleGenAI } from '@google/genai';

async function triageIssue() {
  const issueBody = process.env.ISSUE_BODY;

  if (!issueBody) {
    console.warn('No ISSUE_BODY environment variable provided. Skipping triage.');
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('No GEMINI_API_KEY provided. Skipping triage.');
    return;
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = `Analyze the following issue description and suggest appropriate labels (e.g., bug, feature, documentation) and priority (high, medium, low).
Issue Body:
${issueBody}

Output format: JSON with "labels" (array of strings) and "priority" (string).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text;
    console.info('AI Triage Result:', text);

    // In a real scenario, we would use the GitHub API to add labels here.
    console.info('Mock: Adding labels to issue based on AI suggestion.');
  } catch (error) {
    console.error('Failed to triage issue with AI:', error);
  }
}

triageIssue();
