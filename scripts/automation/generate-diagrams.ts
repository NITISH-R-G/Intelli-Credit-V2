import * as fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import * as path from 'node:path';

function generateDiagrams(): void {
  const outDir = 'docs/architecture';
  fs.mkdirSync(outDir, { recursive: true });


  try {
    // Madge will use graphviz under the hood to generate SVG.
    // Make sure graphviz is installed in CI or the environment.
    execFileSync('npx', ['--yes', 'madge', '--image', 'docs/architecture/dependency-graph.svg', 'src/']);
    console.info(`Architecture diagram generated at ${'docs/architecture/dependency-graph.svg'}`);
  } catch (err) {
    console.error('Failed to generate architecture diagram:', err);
    process.exit(1);
  }
}

generateDiagrams();
