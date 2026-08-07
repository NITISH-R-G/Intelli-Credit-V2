import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import { getAllCodeFilesContent } from './utils.js';

async function analyzeRepo() {
  if (!process.env.GEMINI_API_KEY) {
    console.info('GEMINI_API_KEY not found. Skipping Repository Analysis.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const allCode = getAllCodeFilesContent();

  const prompt = `You are a software architect. Analyze the provided source code and provide a text-based architecture overview, including main components, technologies used, data flow, and potential areas for improvement. Format the output in Markdown.

Code:
${allCode.substring(0, 500000)}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text;
    fs.mkdirSync('docs/architecture', { recursive: true });
    fs.writeFileSync('docs/architecture/repo-analysis.md', report || 'No analysis generated.');
    console.info('Repository analysis generated successfully.');
  } catch (error) {
    console.error('Error generating repository analysis:', error);
    process.exit(1);
  }
}

void analyzeRepo();
