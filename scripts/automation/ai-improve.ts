import fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function improve(): Promise<void> {
  try {
    console.info('Starting AI Continuous Improvement Loop...');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not set. Exiting gracefully.');
      process.exit(0);
    }

    fs.mkdirSync('docs/history', { recursive: true });
    fs.mkdirSync('docs/architecture', { recursive: true });

    // Mocking repo stats reading since reading entire repo is too large, but we prompt AI to generate ideas
    const repoContext =
      'Repository: Intelli-Credit-V2. Tech stack: React, Vite, Tailwind, Express, Google GenAI SDK. Goal: Corporate credit appraisal automation.';

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an AI Staff Engineer analyzing a repository daily. Given the context of this repository: ${repoContext}.
Please generate a brief daily improvement report. Suggest 1-2 actionable technical debt items, architectural improvements, or testing suggestions that a contributor could work on today.`;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const reportContent = aiResponse.text || 'No major improvements suggested today.';
    const report = `# AI Continuous Improvement Report\n\n${reportContent}\n`;

    fs.writeFileSync('ai-improvement-report.md', report, 'utf8');
    console.info('AI Improvement loop completed.');
  } catch (err) {
    console.error('Error during AI improve:', err);
  }
}

improve().catch((err) => {
  console.error('Unhandled error in improve:', err);
  process.exit(1);
});
