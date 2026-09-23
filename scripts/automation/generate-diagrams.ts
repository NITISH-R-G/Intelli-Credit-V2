import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';

function generateDiagrams(): void {
  try {
    const outputDir = 'docs/architecture';
    fs.mkdirSync(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, 'dependency-graph.svg');
    console.info(`Generating architecture diagram at ${outputPath}...`);

    // Ensure madge and graphviz are available. Using npx --yes to avoid prompts.
    execFileSync('npx', [
      '--yes',
      'madge',
      '--image',
      outputPath,
      '--extensions',
      'ts,tsx',
      'src',
      'api'
    ], { stdio: 'inherit' });

    console.info('Diagram generated successfully.');
  } catch (error) {
    console.error('Error generating architecture diagrams:', error);
    process.exit(1);
  }
}

generateDiagrams();