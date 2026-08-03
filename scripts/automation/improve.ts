import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import { execFileSync } from 'node:child_process';

async function improve(): Promise<void> {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not set. Exiting gracefully.');
    process.exit(0);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Gather some repository stats for context
    const packageJsonStr = fs.readFileSync('package.json', 'utf8');
    const lintOutput =
      (execFileSync('npm', ['run', 'lint'], { encoding: 'utf-8' }) as string).substring(0, 2000) ||
      'No lint issues.';

    const prompt = `
You are an AI Continuous Improvement Agent analyzing this repository.
Based on the provided package.json and linting output, suggest exactly one meaningful improvement that can be made.
This could be a code refactor, a dependency update, a new test, or a documentation improvement.

package.json excerpt:
${packageJsonStr.substring(0, 1000)}

Lint Output excerpt:
${lintOutput}

Format your response as a GitHub Issue with the following structure:
---
title: "[AI Suggestion] Your Title Here"
labels: ["enhancement", "ai-suggestion"]
---
## Proposed Improvement
...
## Why this matters
...
## Next Steps
...
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text || 'No recommendations at this time.';

    fs.writeFileSync('ai-improvement-report.md', report, 'utf-8');
    console.info('Successfully generated AI improvement report.');
  } catch (error) {
    // If lint fails, it throws an error in execFileSync, we can handle it
    console.error('Error during AI improvement loop:', error);
    // Still try to generate a report even if lint threw (which it does on non-zero exit)
    if (error && typeof error === 'object' && 'stdout' in error) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const stdoutStr =
          typeof (error as { stdout?: string | Buffer }).stdout === 'string'
            ? (error as { stdout: string }).stdout
            : (error as { stdout?: Buffer }).stdout?.toString() || '';
        const prompt = `You are an AI Continuous Improvement Agent. The linter found issues. Suggest an improvement based on this output: ${stdoutStr.substring(0, 1000)}`;
        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: prompt,
        });
        fs.writeFileSync(
          'ai-improvement-report.md',
          response.text || 'Linting issues found.',
          'utf-8',
        );
        console.info('Successfully generated AI improvement report from lint error.');
      } catch (_e) {
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
}

void improve();
