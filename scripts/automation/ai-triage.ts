import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import * as path from 'node:path';

// AI Triage script for GitHub Issues

const triage = async (): Promise<void> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is missing. Skipping AI Triage.');
      process.exit(0);
    }

    const eventPath = process.env.GITHUB_EVENT_PATH;
    if (!eventPath) {
      console.warn('GITHUB_EVENT_PATH is missing. This script should be run in GitHub Actions.');
      process.exit(0);
    }

    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));

    if (!eventData.issue) {
      console.warn('No issue data found in event payload.');
      process.exit(0);
    }

    const issueTitle = eventData.issue.title || '';
    const issueBody = eventData.issue.body || '';

    // Read relevant TS/TSX files to provide context
    const getCodeContext = (dir: string): string => {
      let context = '';
      const readDirRecursive = (currentDir: string) => {
        if (!fs.existsSync(currentDir)) return;
        const files = fs.readdirSync(currentDir);
        for (const file of files) {
          const filePath = path.join(currentDir, file);
          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            readDirRecursive(filePath);
          } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            context += `\n--- ${filePath} ---\n`;
            context += fs.readFileSync(filePath, 'utf8');
          }
        }
      };
      readDirRecursive(dir);
      return context;
    };

    const srcContext = getCodeContext('src').substring(0, 50000); // Limit context size
    const apiContext = getCodeContext('api').substring(0, 20000);

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are an expert AI maintainer for the Intelli-Credit project.
      Please review the following GitHub Issue and provide a triage report.
      Identify if it's a bug, feature request, or question. Suggest potential fixes or next steps based on the code context.

      Issue Title: ${issueTitle}
      Issue Body: ${issueBody}

      --- Code Context (Partial) ---
      ${apiContext}
      ${srcContext}
      ------------------------------

      Please provide your triage feedback in markdown format, ready to be posted as a comment.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const comment =
      response.text || 'Thank you for opening this issue! Our team will look into it shortly.';

    // Write comment to file for github actions
    fs.writeFileSync('triage-comment.txt', comment);
    console.info('Successfully generated triage comment.');
  } catch (error) {
    console.error('Error during AI triage:', error);
    process.exit(1);
  }
};

triage().catch(err => {
  console.error(err);
  process.exit(1);
});
