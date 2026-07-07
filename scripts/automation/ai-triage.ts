import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

async function run() {
  if (!apiKey) {
    console.warn('No GEMINI_API_KEY provided. Skipping AI Issue Triage.');
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  const title = process.env.ISSUE_TITLE || 'Untitled';
  const body = process.env.ISSUE_BODY || 'No description provided.';

  try {
    const prompt = `You are a senior project manager. Analyze the following GitHub issue and provide a short summary, suggested labels (e.g., bug, enhancement, documentation), and an action plan in Markdown format. \n\nTitle: ${title}\n\nBody: ${body}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    console.info(response.text || 'No triage generated.');
  } catch (error) {
    console.error('Error during AI Triage:', error);
  }
}

run();
