import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

function generateDiagrams(): void {
  try {
    const docsDir = path.join(process.cwd(), 'docs', 'architecture');
    fs.mkdirSync(docsDir, { recursive: true });

    console.info('Generating architecture diagrams using madge...');

    // Ensure --yes is used if invoking via npx in CI to prevent prompts
    execFileSync('npx', [
      '--yes',
      'madge',
      '--image',
      path.join(docsDir, 'dependency-graph.svg'),
      'src',
      'api',
    ]);

    console.info(`Diagrams generated at ${path.join(docsDir, 'dependency-graph.svg')}`);
  } catch (err) {
    console.error('Error generating diagrams:', err);
  }
}

generateDiagrams();
