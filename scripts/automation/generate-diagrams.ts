import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

function generateDiagrams(): void {
  console.info('Generating architecture diagrams...');

  const outputDir = path.join('docs', 'architecture');
  fs.mkdirSync(outputDir, { recursive: true });

  const outputFile = path.join(outputDir, 'architecture-diagram.svg');

  try {
    const output = execFileSync('npx', ['--yes', 'madge', '--image', outputFile, 'src/'], { encoding: 'utf-8' }) as string;
    console.info(`Diagram generated successfully at ${outputFile}.`);
    console.info(output);
  } catch (error: any) {
    console.error('Error generating diagrams:', error.message || error);
    if (error.stdout) {
      console.error('Stdout:', error.stdout);
    }
    if (error.stderr) {
      console.error('Stderr:', error.stderr);
    }
    process.exit(1);
  }
}

generateDiagrams();
