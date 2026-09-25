import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { GoogleGenAI } from '@google/genai';

function getFilesRecursively(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFilesRecursively(filePath, fileList);
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

function getRandomSample<T>(arr: T[], size: number): T[] {
  const shuffled = [...arr].sort(() => crypto.randomBytes(1)[0] / 255 - 0.5);
  return shuffled.slice(0, size);
}

async function improve(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Exiting ai-improve gracefully.');
    process.exit(0);
  }

  try {
    const targetDirs = ['src', 'api', 'scripts'];
    let allFiles: string[] = [];
    for (const dir of targetDirs) {
      allFiles = allFiles.concat(getFilesRecursively(dir));
    }

    if (allFiles.length === 0) {
      console.warn('No .ts or .tsx files found in target directories.');
      return;
    }

    const sampledFiles = getRandomSample(allFiles, Math.min(10, allFiles.length));

    let codeContext = 'Repository Context (Sampled Files):\n\n';
    for (const file of sampledFiles) {
      codeContext += `--- File: ${file} ---\n`;
      codeContext += fs.readFileSync(file, 'utf8') + '\n\n';
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a senior AI architect continuously analyzing the Intelli-Credit-V2 repository.
Based on the following sampled code from the repository, please analyze for:
1. Technical debt
2. Documentation gaps
3. Security risks
4. Performance issues
5. Architectural concerns

Provide a detailed improvement report containing actionable recommendations, automated fix suggestions, and architectural observations. Output in Markdown format.

${codeContext}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const aiResponse = response.text || 'Unable to generate improvement report at this time.';

    const outDir = path.join('docs', 'history');
    fs.mkdirSync(outDir, { recursive: true });

    const timestamp = new Date().toISOString().split('T')[0];
    const outPath = path.join(outDir, 'ai-improvement-report.md');

    let finalOutput = `# AI Continuous Improvement Report (${timestamp})\n\n`;
    finalOutput += aiResponse;

    fs.writeFileSync(outPath, finalOutput);
    console.info(`Successfully generated AI improvement report at ${outPath}`);
  } catch {
    console.error('Error during AI improve processing.');
    process.exit(1);
  }
}

void improve();
