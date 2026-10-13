import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import { execFileSync } from 'node:child_process';

async function reviewPR(): Promise<void> {
  const prUrl = process.env.PR_URL;
  const apiKey = process.env.GEMINI_API_KEY;
  const githubToken = process.env.GITHUB_TOKEN;

  if (!prUrl || !apiKey || !githubToken) {
    process.stderr.write('Missing PR_URL, GEMINI_API_KEY, or GITHUB_TOKEN.\n');
    process.exit(1);
  }

  let diff = '';
  try {
    diff = execFileSync(
      'curl',
      [
        '-s',
        '-H',
        `Authorization: Bearer ${githubToken}`,
        '-H',
        'Accept: application/vnd.github.v3.diff',
        prUrl,
      ],
      { encoding: 'utf-8' },
    ) as string;
  } catch {
    process.stderr.write('Failed to fetch PR diff.\n');
    process.exit(1);
  }

  if (!diff) {
    process.stderr.write('No diff found.\n');
    process.exit(0);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a senior staff engineer AI PR reviewer.
Review the following pull request diff. Look for:
- Logic errors
- Security vulnerabilities
- Performance issues
- Adherence to strict typing (no 'any')
- Code smells
- Missing error handling

Provide a constructive review, suggesting specific fixes where necessary.

Diff:
${diff}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text;
    if (text) {
      fs.writeFileSync('pr-comment.txt', text, 'utf-8');
      process.stdout.write('PR review generated successfully.\n');
    } else {
      process.stderr.write('No text received from Gemini API.\n');
      process.exit(1);
    }
  } catch {
    process.stderr.write('Error generating PR review.\n');
    process.exit(1);
  }
}

await reviewPR().catch(() => process.exit(1));
