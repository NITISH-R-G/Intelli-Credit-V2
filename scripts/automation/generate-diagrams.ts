import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';

function generateDiagrams(): void {
  try {
    const outDir = 'docs/architecture';
    fs.mkdirSync(outDir, { recursive: true });

    // Using madge to generate an SVG dependency graph
    // Depends on graphviz being installed in the environment
    console.info('Running madge to generate SVG...');
    execFileSync(
      'npx',
      [
        '--yes',
        'madge',
        '--image',
        `${outDir}/dependency-graph.svg`,
        '--extensions',
        'ts,tsx',
        'src',
        'api',
        'scripts',
      ],
      { stdio: 'inherit' },
    );

    console.info('Diagrams generated successfully.');
  } catch (error) {
    console.error('Failed to generate diagrams:', error);
    process.exit(1);
  }
}

generateDiagrams();
