import * as fs from 'node:fs';
import { execFileSync } from 'node:child_process';

function generateDiagrams(): void {
  try {
    fs.mkdirSync('docs/architecture', { recursive: true });

    // Generate SVG diagram using madge
    execFileSync('npx', ['--yes', 'madge', '--image', 'docs/architecture/dependency-graph.svg', 'src/App.tsx']);
    console.info('Successfully generated dependency diagram.');
  } catch (error) {
    console.error('Error generating diagrams:', error);
    process.exit(1);
  }
}

generateDiagrams();
