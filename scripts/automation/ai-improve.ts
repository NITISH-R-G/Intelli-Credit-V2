import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import * as path from 'node:path';

// AI Improvement Loop script

const improve = async (): Promise<void> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is missing. Skipping AI Improvement loop.');
      process.exit(0);
    }

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

    const srcContext = getCodeContext('src').substring(0, 40000);
    const apiContext = getCodeContext('api').substring(0, 10000);
    const scriptsContext = getCodeContext('scripts').substring(0, 10000);

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are an expert autonomous software engineer and architect.
      Analyze the provided source code context from the Intelli-Credit repository.
      Identify potential architectural improvements, technical debt, code smells, missing test coverage, or documentation gaps.
      Format your response as a markdown report titled "AI Improvement Loop Recommendations".

      --- Code Context (Partial) ---
      ${apiContext}
      ${srcContext}
      ${scriptsContext}
      ------------------------------
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const reportContent = response.text || '# AI Improvement Loop Recommendations\nNo significant improvements identified at this time.';

    // Write report to file to be picked up by issue creation action
    fs.writeFileSync('ai-improvement-report.md', reportContent);
    console.info('Successfully generated AI improvement report.');

  } catch (error) {
    console.error('Error during AI improvement analysis:', error);
    process.exit(1);
  }
};

improve().catch(err => {
  console.error(err);
  process.exit(1);
});
