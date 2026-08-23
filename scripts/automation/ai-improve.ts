import fs from 'node:fs';
import path from 'node:path';
import { GoogleGenAI } from '@google/genai';

function getFilesRecursively(dir: string, ext: string[]): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.resolve(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(filePath, ext));
    } else {
      if (ext.some(e => file.endsWith(e))) {
        results.push(filePath);
      }
    }
  }
  return results;
}

async function runImprovementLoop() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('No GEMINI_API_KEY found, skipping AI Improvement Loop.');
    process.exit(0);
  }

  const dirsToScan = ['src', 'api', 'scripts'];
  let combinedCode = '';

  for (const dir of dirsToScan) {
    const fullPath = path.resolve(process.cwd(), dir);
    const files = getFilesRecursively(fullPath, ['.ts', '.tsx']);
    for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        combinedCode += `\n--- File: ${path.relative(process.cwd(), file)} ---\n${content}\n`;
    }
  }

  if (!combinedCode) {
    console.info('No relevant code files found to analyze.');
    process.exit(0);
  }

  const prompt = `
Analyze the following codebase to find areas for improvement.
Focus on:
1. Architectural weaknesses
2. Technical debt
3. Potential bugs or edge cases not handled
4. Performance optimizations
5. Security concerns

Codebase:
${combinedCode.substring(0, 30000)} // Truncate if too long

Format your response as a Markdown document outlining the issues and providing actionable recommendations.
`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text || '# AI Improvement Report\nNo significant issues found.';

    const outDir = path.resolve(process.cwd(), 'docs/history');
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'ai-improvement-report.md'), text);
    console.info('Improvement report generated successfully.');
  } catch (error) {
    console.error('Error during AI Improvement Loop:', error);
    process.exit(1);
  }
}

void runImprovementLoop();
