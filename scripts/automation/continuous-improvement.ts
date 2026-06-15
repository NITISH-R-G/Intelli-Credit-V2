import { GoogleGenAI } from '@google/genai';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const main = async () => {
  console.log('Running Continuous Improvement Analysis...');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Skipping generation.');
    return;
  }

  const ai = new GoogleGenAI({ apiKey });

  // Gather basic stats for the prompt
  let stats = '';
  try {
    stats = execSync('npm run analyze:repo > /dev/null 2>&1 && cat metadata.json').toString();
  } catch (e) {
    // fallback if analysis fails
  }

  const prompt = `
You are an autonomous AI maintaining this repository.
Your task is to analyze the repository state and generate a daily continuous improvement report.

Repository Metadata/Stats:
${stats.substring(0, 3000)}

Identify up to 3 areas for improvement across:
1. Technical Debt
2. Documentation Gaps
3. Security Risks
4. Performance Issues
5. Contributor Friction

Provide actionable fixes or recommendations for each identified area.
Output the report in Markdown format.
`;

  let responseText = '';
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    responseText = response.text || 'No issues found.';
  } catch (error) {
    console.error('AI Generation failed:', error);
    responseText = 'AI Generation failed due to an API error.';
  }

  const outDir = path.resolve(process.cwd(), 'docs/improvement-reports');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const reportPath = path.join(outDir, `report-${new Date().toISOString().split('T')[0]}.md`);
  fs.writeFileSync(
    reportPath,
    `# Daily Continuous Improvement Report\nDate: ${new Date().toISOString()}\n\n${responseText}`,
  );

  // also write to a fixed file for PR creation
  fs.writeFileSync(path.resolve(process.cwd(), 'latest-improvement-report.md'), responseText);

  console.log(`Report generated successfully at ${reportPath}`);
};

main().catch(console.error);
