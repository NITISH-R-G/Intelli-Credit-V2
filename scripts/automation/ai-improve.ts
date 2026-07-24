import { GoogleGenAI } from '@google/genai';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

async function improve() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    process.exit(0);
  }

  let repoTree = '';
  try {
    repoTree = execFileSync('git', ['ls-files'], { encoding: 'utf-8' }) as string;
  } catch (err) {
    console.error('Failed to list repository files', err);
    repoTree = 'Could not retrieve repository tree.';
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are an AI architect working on continuous repository improvement.
Here is the current repository file tree:
${repoTree}

Analyze this structure and the general nature of an automated corporate credit appraisal application (React, Node, Vercel).
Identify weaknesses, missing documentation, structural problems, or potential technical debt.
Generate a markdown report with concrete recommendations for improving the repository.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    const reply = response.text || 'No immediate improvements identified.';
    fs.writeFileSync('ai-improvement-report.md', reply);
    console.info('Improvement report generated successfully.');
  } catch (error) {
    console.error('Failed to generate improvement report:', error);
    process.exit(1);
  }
}

void improve();
