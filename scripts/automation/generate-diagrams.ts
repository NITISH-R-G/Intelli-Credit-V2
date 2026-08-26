import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';

function generateDiagrams(): void {
  fs.mkdirSync('docs/architecture', { recursive: true });

  try {
    execFileSync('npx', [
      '--yes',
      'madge',
      '--image',
      'docs/architecture/dependency-graph.svg',
      'src/',
    ]);
    console.info('Successfully generated dependency graph SVG.');
  } catch (error) {
    console.error('Failed to generate dependency graph SVG.', error);
    process.exit(1);
  }
}

generateDiagrams();
