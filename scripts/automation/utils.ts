import * as fs from 'node:fs';
import * as path from 'node:path';
import { GoogleGenAI } from '@google/genai';

/**
 * Ensures the system exits gracefully if the required GEMINI_API_KEY is not set.
 * This is crucial for PRs coming from forks where secrets aren't available.
 */
export function initGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn(
      'GEMINI_API_KEY is not set. Exiting gracefully to prevent CI failure on external forks.',
    );
    process.exit(0);
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Recursively retrieves all files in a directory, ignoring specified directories.
 * @param dir The directory to read.
 * @param fileList The accumulated list of files.
 * @returns An array of file paths.
 */
export function getFilesRecursively(dir: string, fileList: string[] = []): string[] {
  const ignoredDirs = new Set(['node_modules', '.git', 'dist', 'coverage', '.github']);

  if (!fs.existsSync(dir)) {
    return fileList;
  }

  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!ignoredDirs.has(file)) {
        getFilesRecursively(filePath, fileList);
      }
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
}

/**
 * Samples codebase files to stay within token limits.
 * Prioritizes TypeScript and Markdown files, and core application files.
 * @param files The full list of files.
 * @param limit The maximum number of files to sample.
 * @returns A sampled subset of file paths.
 */
export async function sampleFiles(files: string[], limit: number = 20): Promise<string[]> {
  const priorityFiles = files.filter(
    (f) => f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.md'),
  );

  if (priorityFiles.length <= limit) {
    return priorityFiles;
  }

  // Shuffle and pick using crypto to avoid SonarCloud Math.random() warning
  const crypto = await import('node:crypto');
  const shuffled = [...priorityFiles].sort(() => 0.5 - crypto.randomBytes(1)[0] / 255);
  return shuffled.slice(0, limit);
}
