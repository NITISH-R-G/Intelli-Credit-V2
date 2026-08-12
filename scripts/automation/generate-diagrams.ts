import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function generateDiagrams(): void {
  const docsDir = path.join('docs', 'architecture');
  fs.mkdirSync(docsDir, { recursive: true });

  console.info('Generating architecture diagrams using madge...');

  try {
    const output = (
      execFileSync('npx', [
        '--yes',
        'madge',
        '--image',
        path.join(docsDir, 'architecture.svg'),
        'src/',
      ]) as unknown as Buffer
    ).toString();
    console.info('Madge output:', output);
    console.info('Architecture diagram generated successfully.');
  } catch (error) {
    console.error('Failed to generate architecture diagrams:', error);
    process.exit(1);
  }
}

generateDiagrams();
