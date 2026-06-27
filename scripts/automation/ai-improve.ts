import { GoogleGenAI } from '@google/genai';
import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set');
    process.exit(1);
  }

  try {
    // Get list of typescript files
    let output = '';
    try {
      output = execFileSync('find', ['src', 'api', '-name', '*.ts'], { encoding: 'utf-8' });
    } catch {
       console.warn('Could not run find command on src and api directories');
    }
    const files = output.trim().split('\n').filter(Boolean).slice(0, 5); // Just a sample for analysis to stay within token limits

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Analyze this project's structure and suggest improvements for technical debt, performance, and security.
Here are some of the main files:
${files.join('\n')}

Generate a comprehensive markdown report.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const report = response.text || 'No report generated.';

    // Save report
    writeFileSync('improvement-report.md', report);
    console.info('Improvement report generated at improvement-report.md');
  } catch (error) {
    console.error('Error in AI improvement loop:', error);
    process.exit(1);
  }
}

main();
