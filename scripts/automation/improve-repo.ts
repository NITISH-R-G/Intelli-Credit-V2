import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const main = async () => {
  console.log('Running Autonomous Repository Improver...');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Skipping AI improvement generation.');
    return;
  }

  // Load existing metadata to understand the repo
  const metadataPath = path.resolve(process.cwd(), 'metadata.json');
  let metadata: any = {};
  if (fs.existsSync(metadataPath)) {
    metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert AI software architect and technical debt manager.
Analyze the following repository metadata to identify potential improvements, technical debt, and architectural concerns.

Repository Metadata:
${JSON.stringify(metadata, null, 2).substring(0, 50000)}

Tasks:
1. Identify any missing modern tools or best practices based on the framework and dependencies.
2. Suggest ways to improve the project's automation or CI/CD pipelines.
3. Detect potential architectural flaws or bottlenecks based on the directory structure.
4. Recommend refactoring opportunities.
5. Suggest new features or optimizations to improve the contributor experience.

Provide a structured markdown report detailing your findings and actionable recommendations.
`;

  let responseText = '';
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    responseText = response.text || 'No recommendations generated.';
  } catch (error) {
    console.error('AI Generation failed:', error);
    responseText = 'AI Generation failed due to an API error.';
  }

  const outDir = path.resolve(process.cwd(), 'docs/improvements');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const reportContent = `# Autonomous Repository Improvement Report
Date: ${new Date().toISOString()}

${responseText}
`;

  const reportPath = path.join(outDir, `improvement-${Date.now()}.md`);
  fs.writeFileSync(reportPath, reportContent);

  console.log(`Improvement report generated successfully at ${reportPath}`);
};

main().catch(console.error);
