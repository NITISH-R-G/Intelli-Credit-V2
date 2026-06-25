import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import { getAllFiles } from './utils.js';

async function improveCode() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set.');
    return;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const files = getAllFiles('src');

  if (files.length === 0) {
    console.info('No files found to analyze.');
    return;
  }

  // To avoid hitting API limits, let's just analyze the first file for now in the automated loop,
  // or a random file. Let's pick a random one.
  const randomFile = files[Math.floor(Math.random() * files.length)];
  const content = fs.readFileSync(randomFile, 'utf8');

  const prompt = `Analyze the following TypeScript code from ${randomFile}. Suggest one concrete improvement for technical debt, readability, or performance. Keep it brief. Code: \n${content}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    console.info(`AI Recommendation for ${randomFile}:\n${response.text}`);
  } catch (error) {
    console.error('Error querying Gemini:', error);
  }
}

improveCode();
