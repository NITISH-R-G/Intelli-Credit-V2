import fs from 'node:fs';
import path from 'node:path';
import { GoogleGenAI } from '@google/genai';

async function analyzeRepo(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('No GEMINI_API_KEY provided. Skipping AI repo analysis.');
    process.exit(0);
  }

  const docsDir = path.join(process.cwd(), 'docs', 'architecture');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // In a real application, you'd extract code logic, read key files, etc.
    const pkgJSON = fs.readFileSync('package.json', 'utf-8');

    const prompt = `You are a staff engineer. Analyze this project's package.json to determine its architectural patterns, technologies, and likely use cases. Output a detailed architecture summary in markdown.

package.json:
\`\`\`json
${pkgJSON}
\`\`\`
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const reportContent = response.text || '# Repository Analysis\n\nCould not generate analysis.';

    fs.writeFileSync(path.join(docsDir, 'repo-analysis.md'), reportContent, 'utf-8');
    console.info('Successfully generated repository analysis.');
  } catch (error) {
    console.error('Error during repository analysis:', error);
    process.exit(1);
  }
}

void analyzeRepo();
