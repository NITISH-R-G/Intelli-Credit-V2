import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';

function analyzeRepo(): void {
  console.info('Starting repository analysis...');

  try {
    fs.mkdirSync('docs/architecture', { recursive: true });

    // Generate JSON knowledge graph
    console.info('Generating knowledge graph...');
    execFileSync('npx', [
      '--yes',
      'madge',
      'src/',
      'api/',
      'server.ts',
      '--json',
      'docs/architecture/knowledge-graph.json',
    ]);

    // Attempt to generate SVG graph (requires graphviz)
    console.info('Generating dependency graph diagram...');
    execFileSync('npx', [
      '--yes',
      'madge',
      'src/',
      'api/',
      'server.ts',
      '--image',
      'docs/architecture/dependency-graph.svg',
    ]);

    console.info('Repository analysis complete.');
  } catch (error) {
    console.error(
      'Failed to analyze repository. Ensure graphviz is installed for image generation.',
      error,
    );
    process.exit(1);
  }
}

analyzeRepo();
