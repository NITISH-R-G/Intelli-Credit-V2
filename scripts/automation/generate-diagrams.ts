import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';

function generateDiagrams() {
  fs.mkdirSync('docs/architecture', { recursive: true });

  console.info('Generating architecture diagrams using madge...');

  try {
    const output = execFileSync(
      'npx',
      ['--yes', 'madge', '--image', 'docs/architecture/dependency-graph.svg', 'src/'],
      { encoding: 'utf-8' },
    ) as unknown as string;
    console.info(output);
    console.info('Successfully generated dependency-graph.svg');
  } catch (error) {
    console.error('Failed to generate diagrams with madge:', error);
    process.exit(1);
  }
}

generateDiagrams();
