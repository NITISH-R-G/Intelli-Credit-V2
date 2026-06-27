import { GoogleGenAI } from '@google/genai';
import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set');
    process.exit(1);
  }

  try {
    let packageJson = '';
    try {
      packageJson = execFileSync('cat', ['package.json'], { encoding: 'utf-8' });
    } catch {
      console.error('Could not read package.json');
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Analyze this repository's health based on its package.json. Focus on dependency health, scripts, and potential technical debt.

${packageJson}

Generate a concise Markdown report on the repository health.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const report = response.text || '# Repo Health\n\nNo report could be generated.';

    writeFileSync('docs/repo-health.md', report);
    console.info('Repo health report generated at docs/repo-health.md');
  } catch {
    console.error('Error in analyze-repo.');
    process.exit(1);
  }
}

main();
