import { execFileSync } from 'child_process';
import * as fs from 'fs';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.info('GEMINI_API_KEY is not set. Exiting ai improve.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

async function improve() {
  try {
    const prompt = `You are an AI continuous improvement agent for the Intelli-Credit Terminal repository.
Your task is to identify technical debt, documentation gaps, and potential security risks based on standard modern web development practices for a React/Node.js application.

Generate a daily improvement report with actionable recommendations.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text || 'No significant improvements identified today.';
    fs.writeFileSync('ai-improvement-report.md', report);
    console.info('Improvement report generated successfully.');
  } catch (error) {
    console.error('Error in ai improve:', error);
  }
}

void improve();
