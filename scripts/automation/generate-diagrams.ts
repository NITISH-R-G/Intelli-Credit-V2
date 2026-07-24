import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

function generateDiagrams() {
  fs.mkdirSync('docs/architecture', { recursive: true });

  try {
    execFileSync('npx', ['--yes', 'madge', '--image', 'docs/architecture/dependency-graph.svg', 'server.ts', 'src/'], { stdio: 'inherit' });
    console.info('Architecture diagrams generated successfully.');
  } catch (error) {
    console.error('Failed to generate architecture diagrams:', error);
    // Exit 0 to not fail CI if graphviz is missing locally, workflow ensures it's installed
  }
}

generateDiagrams();
