import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';

const outputDir = 'docs/architecture';

function generateDiagrams() {
  fs.mkdirSync(outputDir, { recursive: true });

  try {
    execFileSync(
      'npx',
      ['--yes', 'madge', '--image', `${outputDir}/dependency-graph.svg`, 'src', 'api', 'scripts'],
      { stdio: 'inherit' },
    );

    console.info('Dependency graph diagram generated successfully.');
  } catch (error) {
    console.error('Error generating dependency diagram (is graphviz installed?):', error);
    process.exit(1);
  }
}

generateDiagrams();
