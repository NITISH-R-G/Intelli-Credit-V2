import * as fs from 'node:fs';
import { execFileSync } from 'node:child_process';

function generateDiagrams() {
  console.info('Generating repository diagrams...');
  const outDir = 'docs/architecture';
  fs.mkdirSync(outDir, { recursive: true });

  try {
    console.info('Generating SVG dependency graph...');
    execFileSync(
      'npx',
      ['--yes', 'madge', '--image', `${outDir}/dependency-graph.svg`, 'src/', 'api/', 'server.ts'],
      { stdio: 'inherit' },
    );
    console.info('Diagram generated successfully.');
  } catch (error) {
    console.error('Error generating diagrams (is graphviz installed?):', error);
  }
}

void generateDiagrams();
