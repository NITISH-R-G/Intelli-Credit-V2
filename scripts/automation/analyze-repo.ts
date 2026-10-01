import * as fs from 'node:fs';
import { execFileSync } from 'node:child_process';

function analyze() {
  fs.mkdirSync('docs/architecture', { recursive: true });

  try {
    console.info('Generating dependency graph...');
    execFileSync('npx', [
      '--yes',
      'madge',
      '--image',
      'docs/architecture/dependency-graph.svg',
      '--extensions',
      'ts,tsx,js,jsx',
      'src',
    ]);
    console.info('Dependency graph generated.');
  } catch (error) {
    console.error('Error generating dependency graph:', error);
  }

  try {
    console.info('Generating knowledge graph...');
    const output = execFileSync(
      'npx',
      ['--yes', 'madge', '--json', '--extensions', 'ts,tsx,js,jsx', 'src'],
      { encoding: 'utf-8' },
    ) as string;

    fs.writeFileSync('docs/architecture/knowledge-graph.json', output);
    console.info('Knowledge graph generated.');
  } catch (error) {
    console.error('Error generating knowledge graph:', error);
  }
}

analyze();
