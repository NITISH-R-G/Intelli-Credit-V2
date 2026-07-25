import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.info('GEMINI_API_KEY is missing. Skipping AI Continuous Improvement Loop.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

async function runImprovementLoop(): Promise<void> {
  try {
    console.info('Starting AI Continuous Improvement Analysis...');

    // Collect some basic repository stats
    let gitLog = '';
    try {
      gitLog = execFileSync('git', ['log', '-n', '50', '--oneline'], {
        encoding: 'utf-8',
      }) as string;
    } catch (e) {
      console.warn('Could not fetch git log.', e);
    }

    let pkgJson = '';
    try {
      pkgJson = fs.readFileSync('package.json', 'utf8');
    } catch (e) {
      console.warn('Could not read package.json.', e);
    }

    const prompt = `
You are an expert AI repository maintainer and Staff Engineer for "Intelli-Credit Terminal", an AI-powered corporate credit appraisal system using Google Gemini.

Your task is to analyze the recent state of the repository and generate a daily continuous improvement report.
Identify weaknesses, technical debt, documentation gaps, security risks, performance issues, contributor friction, and architectural concerns.

Here is the package.json to understand dependencies:
\`\`\`json
${pkgJson}
\`\`\`

Here are the last 50 commits to understand recent activity:
\`\`\`
${gitLog}
\`\`\`

Based on this, generate a comprehensive markdown report. Include:
1. Executive Summary
2. Identified Weaknesses & Tech Debt
3. Security & Dependency Health
4. Actionable Recommendations (prioritized)

Output ONLY the raw markdown text for the report. Do not use markdown code blocks to wrap the entire response.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report = response.text || '';
    if (report) {
      const docsDir = 'docs/history';
      if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
      }
      fs.writeFileSync('ai-improvement-report.md', report, 'utf8');

      // Also save a timestamped copy to history
      const dateStr = new Date().toISOString().split('T')[0];
      fs.writeFileSync(path.join(docsDir, `improvement_${dateStr}.md`), report, 'utf8');

      console.info('Continuous Improvement report generated successfully.');
    } else {
      console.warn('AI generated an empty report.');
    }
  } catch (error) {
    console.error('Error during improvement loop:', error);
    process.exit(1);
  }
}

void runImprovementLoop();
