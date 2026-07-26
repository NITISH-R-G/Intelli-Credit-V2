import fs from 'node:fs';
import path from 'node:path';
import { GoogleGenAI } from '@google/genai';
import { execFileSync } from 'node:child_process';

async function improve(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('GEMINI_API_KEY not found. Skipping continuous improvement.');
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });

  console.info('Analyzing repository...');

  let packageJsonStr = '';
  try {
    packageJsonStr = fs.readFileSync('package.json', 'utf8');
  } catch (e) {
    console.error('Could not read package.json', e);
  }

  let lintWarnings = '';
  try {
    // Run linting to get warnings/errors, ignore non-zero exit code
    lintWarnings = execFileSync('npx', ['--yes', 'eslint', '.'], { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }) as string;
  } catch (e: any) {
    lintWarnings = (e.stdout as string) || '';
  }

  const prompt = `You are an expert AI Architect executing the Continuous Improvement Loop for this repository.
Here is the package.json:
${packageJsonStr}

Here is the output from our linting process (which may contain warnings/errors):
${lintWarnings.substring(0, 3000)} // truncate to avoid giant prompts

Please analyze the current state of the repository based on these artifacts and recommend continuous improvement tasks.
Generate a report highlighting:
- Technical debt
- Dependency updates
- Code quality improvements
- Architecture or documentation gaps

Provide your output in Markdown format. Ensure it includes a catchy title.`;

  try {
    console.info('Generating improvement report via Gemini...');
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    if (response.text) {
      const outputDir = path.join('docs', 'history');
      fs.mkdirSync(outputDir, { recursive: true });
      fs.writeFileSync('ai-improvement-report.md', response.text, 'utf8');

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      fs.writeFileSync(path.join(outputDir, `improvement-${timestamp}.md`), response.text, 'utf8');

      console.info('Improvement report written to ai-improvement-report.md and docs/history/.');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    process.exit(1);
  }
}

void improve();
