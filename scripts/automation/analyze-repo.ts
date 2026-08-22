import { execFileSync } from 'child_process';
import * as fs from 'fs';

function generateDiagrams(): void {
  fs.mkdirSync('docs/architecture', { recursive: true });
  console.info('Generating architecture diagrams using madge...');
  try {
    execFileSync('npx', [
      '--yes',
      'madge',
      '--image',
      'docs/architecture/dependency-graph.svg',
      './src/main.tsx',
      '--extensions',
      'ts,tsx',
    ]);
    const jsonOutput = (
      execFileSync('npx', [
        '--yes',
        'madge',
        '--json',
        './src',
        './api',
        '--extensions',
        'ts,tsx',
      ]) as unknown as Buffer
    ).toString('utf-8');
    fs.writeFileSync('docs/architecture/knowledge-graph.json', jsonOutput);
  } catch (e) {
    console.error('Error generating diagrams with madge', e);
  }
}

generateDiagrams();
