import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';

async function improveRepo() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Exiting gracefully.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });

  // Gather basic repository stats to feed the AI
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const depsCount = Object.keys(packageJson.dependencies || {}).length;
  const devDepsCount = Object.keys(packageJson.devDependencies || {}).length;

  const prompt = `
You are an expert AI repository maintainer running a continuous improvement loop.
Analyze the current state of this repository.

Project Name: ${packageJson.name}
Dependencies: ${depsCount}
Dev Dependencies: ${devDepsCount}

Based on general best practices for modern web and Node.js applications,
suggest 3 to 5 actionable improvements we can make to this repository to improve:
- Technical debt
- Security
- Documentation
- Automation

Format your response as markdown. Keep it constructive and detailed.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text || 'No recommendations generated.';
    const finalContent = `# AI Continuous Improvement Report\n\n${report}`;

    fs.writeFileSync('ai-improvement-report.md', finalContent, 'utf-8');
    console.info('Successfully generated AI improvement report.');
  } catch (error) {
    console.error('Failed to generate improvement report:', error);
    process.exit(1);
  }
}

void improveRepo();
