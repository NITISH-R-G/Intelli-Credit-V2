import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import { execFileSync } from 'child_process';

async function improveRepo() {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not found. Skipping repo improvement analysis.');
    process.exit(0);
  }

  // Gather basic repo stats for the prompt
  let tree = '';
  try {
    // get a high level tree structure
    tree = (execFileSync('find', ['.', '-maxdepth', '3', '-not', '-path', '*/node_modules/*', '-not', '-path', '*/.git/*']) as unknown as Buffer).toString().trim();
  } catch (e) {
    console.error('Error fetching tree', e);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `
  You are an autonomous AI system maintaining this repository.
  Analyze the high level repository structure provided and suggest 1-3 concrete, actionable improvements for code quality, automation, or documentation.
  Format your response as a GitHub issue body.

  Repository Structure:
  ${tree.substring(0, 5000)} // Truncated to avoid token limits
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text || '';

    // Add frontmatter for the issue creation action
    const issueContent = `---
title: "[AI Continuous Improvement] Routine Repository Analysis Recommendations"
labels: ["enhancement", "ai-suggestion"]
---
${text}`;

    fs.writeFileSync('ai-improvement-report.md', issueContent);
    console.info('Improvement report generated and saved to ai-improvement-report.md.');
  } catch (error) {
    console.error('Error generating improvement report:', error);
    process.exit(1);
  }
}

void improveRepo();
