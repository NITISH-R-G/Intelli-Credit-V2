import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function generateDiagrams(): void {
  console.info('Generating architecture diagrams using madge...');
  const outDir = path.resolve(process.cwd(), 'docs/architecture');
  fs.mkdirSync(outDir, { recursive: true });
  const outputFile = path.join(outDir, 'dependency-graph.svg');

  try {
    execFileSync('npx', ['--yes', 'madge', '--image', outputFile, 'src/', 'api/', 'scripts/'], {
      stdio: 'inherit',
    });
    console.info(`Diagram generated successfully at ${outputFile}`);
  } catch (error) {
    console.error('Error generating diagrams:', error);
    throw error;
  }
}

generateDiagrams();
