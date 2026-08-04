import fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

async function improve(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('No GEMINI_API_KEY provided. Skipping AI improve loop.');
    process.exit(0);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Note: A full implementation would read various metrics and code analysis files here.
    // For simplicity, we create a general prompt.
    const prompt = `You are a staff engineer analyzing an open source repository.
Based on standard best practices for React, Node, and TypeScript codebases, please suggest 3 to 5 continuous improvement tasks to improve repository health, automation, technical debt, or contributor experience. Provide actionable recommendations. Format the response as a markdown issue.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const reportContent = response.text || '# AI Improvement Suggestions\n\nNo major suggestions at this time.';

    // Add frontmatter for the issue creator action
    const fullReport = `---\ntitle: 'AI Continuous Improvement Recommendations'\nlabels: 'enhancement, ai-generated'\n---\n\n${reportContent}`;

    fs.writeFileSync('ai-improvement-report.md', fullReport, 'utf-8');
    console.info('Successfully generated AI improvement report.');
  } catch (error) {
    console.error('Error during AI improve:', error);
    process.exit(1);
  }
}

void improve();
