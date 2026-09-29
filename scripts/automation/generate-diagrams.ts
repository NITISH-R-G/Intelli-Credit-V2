import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';

function generateDiagrams(): void {
  const outDir = path.join('docs', 'architecture');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, 'dependency-graph.svg');
  console.info(`Generating architecture diagram to ${outPath}`);

  try {
    const output = execFileSync('npx', ['--yes', 'madge', '--image', outPath, 'src/'], {
      encoding: 'utf-8',
    }) as string;
    console.info('Successfully generated diagram:', output);
  } catch (error) {
    console.error('Failed to generate diagrams:', error);
    process.exitCode = 1;
  }
}

generateDiagrams();
