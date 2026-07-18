import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.info('GEMINI_API_KEY not found. Skipping continuous improvement loop.');
    process.exit(0);
  }

  let codeContext = '';
  const filesToRead = [
    'package.json',
    'server.ts',
    'vite.config.ts',
    'api/analyze.ts',
    'src/App.tsx',
  ];

  try {
    for (const file of filesToRead) {
      if (fs.existsSync(file)) {
        codeContext += `\n\n--- ${file} ---\n${fs.readFileSync(file, 'utf-8')}`;
      }
    }
  } catch (error) {
    console.warn('Could not read context files:', error);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Analyze the provided codebase files and generate a code quality report and refactoring suggestions. Identify weaknesses, technical debt, security risks, and performance issues.

Files:
${codeContext}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const report = response.text;

    fs.mkdirSync('docs/architecture', { recursive: true });
    fs.writeFileSync('docs/architecture/improvement-report.md', report || 'No report generated.');
    console.info('Successfully generated improvement report.');
  } catch (err) {
    console.error('Error generating improvement report:', err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
