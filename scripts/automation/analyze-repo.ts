import * as fs from 'node:fs';
import { execFileSync } from 'node:child_process';

function analyze(): void {
  try {
    fs.mkdirSync('docs/architecture', { recursive: true });

    console.info('Running madge for dependency graph...');
    try {
      execFileSync('npx', [
        '--yes',
        'madge',
        '--image',
        'docs/architecture/dependency-graph.svg',
        'src/',
      ]);
    } catch (e) {
      console.warn('madge --image failed. Ensure graphviz is installed.');
    }

    console.info('Running madge for knowledge graph (JSON)...');
    try {
      const output = (
        execFileSync('npx', ['--yes', 'madge', '--json', 'src/']) as unknown as Buffer
      ).toString();
      fs.writeFileSync('docs/architecture/knowledge-graph.json', output, 'utf8');
    } catch (e) {
      console.warn('madge --json failed.');
    }

    console.info('Repository analysis complete.');
  } catch (error) {
    console.error('Error during repository analysis:', error);
  }
}

analyze();
