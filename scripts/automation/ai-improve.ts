import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function runImprovementLoop() {
  console.info('Starting continuous improvement loop...');
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY environment variable is missing.');
    process.exit(1);
  }

  let lintOutput = '';
  try {
    console.info('Running linters to detect technical debt...');
    lintOutput = execFileSync('npx', ['eslint', '.', '--format', 'json'], {
      encoding: 'utf8',
    }).toString();
    console.info('Linter analysis complete with no issues.');
  } catch (error: any) {
    if (error.status === 1 && error.stdout) {
      console.info('Technical debt found. Processing results for AI improvements...');
      lintOutput = error.stdout.toString();
    } else {
      console.error('Error running continuous improvement loop:', error);
      process.exit(1);
    }
  }

  if (!lintOutput) {
    console.info('No linting issues found to improve upon.');
    process.exit(0);
  }

  try {
    const lintData = JSON.parse(lintOutput);
    const issues = lintData
      .filter((file: any) => file.messages.length > 0)
      .map((file: any) => {
        return (
          `${file.filePath}:\n` +
          file.messages.map((m: any) => `  - [${m.ruleId}] Line ${m.line}: ${m.message}`).join('\n')
        );
      })
      .join('\n\n');

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a staff engineer analyzing automated linting and code quality checks to find technical debt.
Here are the current code quality issues:

${issues}

Generate a concise markdown report summarizing the top 3 areas of technical debt to focus on for refactoring. Do not just list the errors, but categorize the themes (e.g. "Too many any types in tests", "Unused variables indicating dead code").`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    writeFileSync(
      'docs/continuous-improvement-report.md',
      response.text || 'No recommendations generated.',
    );
    console.info(
      'Improvement recommendations generated successfully and saved to docs/continuous-improvement-report.md.',
    );
  } catch (e) {
    console.error('Failed to parse lint output or contact Gemini', e);
    process.exit(1);
  }
}

runImprovementLoop();
