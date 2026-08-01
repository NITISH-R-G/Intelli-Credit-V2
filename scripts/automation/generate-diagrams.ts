import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

async function generateDiagrams(): Promise<void> {
  try {
    console.info('Starting Architecture Diagram Generation...');
    fs.mkdirSync('docs/architecture', { recursive: true });

    // Using npx madge (ensure --yes flag is included)
    execFileSync(
      'npx',
      ['--yes', 'madge', '--image', 'docs/architecture/dependency-graph.svg', 'src/'],
      { stdio: 'inherit' },
    );

    console.info('Diagrams generated successfully.');
  } catch (err) {
    console.error('Error generating diagrams:', err);
  }
}

generateDiagrams().catch((err) => {
  console.error('Unhandled error in generateDiagrams:', err);
  process.exit(1);
});
