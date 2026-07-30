import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import { execFileSync } from 'child_process';

async function improve() {
  if (!process.env.GEMINI_API_KEY) {
    console.info('GEMINI_API_KEY not found. Skipping AI Continuous Improvement loop gracefully.');
    process.exit(0);
  }

  // Gather basic repository state
  const packageJsonStr = fs.existsSync('package.json')
    ? fs.readFileSync('package.json', 'utf-8')
    : '';
  const deps = packageJsonStr ? JSON.parse(packageJsonStr).dependencies : {};

  let recentCommits = '';
  try {
    recentCommits = (
      execFileSync('git', ['log', '-n', '5', '--oneline']) as unknown as Buffer
    ).toString('utf-8');
  } catch {
    console.warn('Failed to retrieve recent commits.');
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `You are an AI architect and continuous improvement system for the Intelli-Credit project.
Your goal is to analyze the high-level state of the repository, identify weaknesses, technical debt, security risks, documentation gaps, and performance issues.

Here is some context:
Recent Commits:
${recentCommits}

Dependencies:
${JSON.stringify(deps, null, 2)}

Provide an "AI Continuous Improvement Report" in Markdown format with actionable recommendations.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    fs.writeFileSync('ai-improvement-report.md', response.text, 'utf-8');
    console.info('Successfully generated AI improvement report.');
  } catch (error) {
    console.error('Error calling Gemini API for improvement loop:', error);
    process.exit(1);
  }
}

void improve();
