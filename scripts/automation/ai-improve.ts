import * as fs from 'node:fs';
import * as path from 'node:path';
import { initGenAI, getFilesRecursively, sampleFiles } from './utils.js';

async function improve(): Promise<void> {
  const ai = initGenAI();
  if (!ai) return;

  const repoRoot = process.cwd();
  const allFiles = getFilesRecursively(repoRoot);
  const sampledFiles = await sampleFiles(allFiles, 30);

  let codebaseContext = '';
  for (const file of sampledFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const relativePath = path.relative(repoRoot, file);
      codebaseContext += `\n--- File: ${relativePath} ---\n${content.slice(0, 1000)}\n`;
    } catch {
      // Ignore unreadable files
    }
  }

  const prompt = `You are an AI architect and continuous improvement system for Intelli-Credit.
Analyze the following sampled files from the repository to identify technical debt, missing documentation, structural improvements, and potential features.

${codebaseContext}

Generate a markdown report titled "# AI Continuous Improvement Report".
Include:
1. Technical Debt & Refactoring Opportunities
2. Security & Performance Findings
3. Documentation Gaps
4. Actionable Next Steps`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const report =
      response.text ||
      '# AI Continuous Improvement Report\n\nNo significant improvements identified today.';

    const outputDir = path.join(repoRoot, 'docs', 'history');
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'ai-improvement-report.md'), report);

    console.info('Continuous improvement report generated successfully.');
  } catch (err: unknown) {
    console.error('Failed to generate improvement report:', err);
    process.exit(1);
  }
}

void improve();
