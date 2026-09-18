import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';

async function improve(): Promise<void> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. Exiting ai-improve gracefully.');
      process.exit(0);
    }

    fs.mkdirSync('docs/history', { recursive: true });

    // Ensure we read contents
    let filesSample = '';
    const filesToRead = ['src/App.tsx', 'api/analyze.ts', 'package.json'];
    for (const f of filesToRead) {
      if (fs.existsSync(f)) {
        filesSample += `\n--- ${f} ---\n` + fs.readFileSync(f, 'utf8').substring(0, 5000);
      }
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are an autonomous AI agent responsible for improving this repository.
Here is a sample of the codebase:
${filesSample}

Please suggest 1-2 actionable improvements for this codebase. Focus on architecture, security, or maintainability.
Output the suggestions as a markdown report.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text;
    if (text) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `docs/history/ai-improvement-report-${timestamp}.md`;
      fs.writeFileSync(filename, text, 'utf8');
      fs.writeFileSync('docs/history/ai-improvement-report.md', text, 'utf8');
      console.info(`Successfully generated AI improvement report at ${filename}.`);
    }
  } catch (error) {
    console.error('Error during AI improvement loop:', error);
  }
}

improve().catch((err) => {
  console.error('Unhandled error in improve:', err);
  process.exit(1);
});
