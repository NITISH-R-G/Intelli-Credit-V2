import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';

const docsDir = 'docs/architecture';
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

function generateDiagrams() {
  try {
    console.info('Generating architecture diagrams using madge...');

    // npx madge src --image docs/architecture/dependency-graph.svg
    // Using execFileSync to prevent command injection and hang
    execFileSync(
      'npx',
      ['--yes', 'madge', 'src', '--image', path.join(docsDir, 'dependency-graph.svg')],
      { stdio: 'inherit' },
    );

    console.info('Architecture diagrams successfully generated.');
  } catch (error) {
    console.error('Failed to generate architecture diagrams:', error);
    process.exit(1);
  }
}

generateDiagrams();
