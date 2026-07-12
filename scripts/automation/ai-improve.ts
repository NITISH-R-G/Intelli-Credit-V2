import { GoogleGenAI } from '@google/genai';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';

async function main() {
  console.info('Starting AI continuous improvement loop...');

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is missing.');
    console.error('Fatal Error');
    process.exitCode = 1;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // Read some basic repo context to ground the AI
  let pkgInfo = '';
  try {
    pkgInfo = fs.readFileSync('package.json', 'utf-8');
  } catch (e) {
    console.error('Failed to read package.json', e);
  }

  const prompt = `
    You are an expert AI maintainer for the Intelli-Credit open-source repository.
    Analyze the current repository setup (package.json contents provided) and suggest 3 actionable areas for improvement
    (e.g., technical debt, documentation gaps, security risks, performance issues).

    Package Info:
    ${pkgInfo}

    Return your response as a markdown formatted report.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const report = response.text || 'No improvement suggestions generated.';
    console.info('Improvement Report Generated.');

    const title = `AI Maintenance: Continuous Improvement Report (${new Date().toISOString().split('T')[0]})`;

    console.info('Creating GitHub issue...');
    execFileSync(
      'gh',
      [
        'issue',
        'create',
        '--title',
        title,
        '--body',
        report,
        '--label',
        'ai-maintenance,enhancement',
      ],
      { stdio: 'inherit' },
    );
    console.info('Continuous improvement loop complete.');
  } catch (error) {
    console.error('Failed to run AI improvement loop:', error);
    console.error('Fatal Error');
    process.exitCode = 1;
  }
}

main();
