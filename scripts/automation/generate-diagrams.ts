import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';

function generateDiagrams(): void {
  console.info('Generating architecture diagrams using madge...');

  fs.mkdirSync('docs/architecture', { recursive: true });

  try {
    // Generate image
    execFileSync(
      'npx',
      ['--yes', 'madge', '--image', 'docs/architecture/dependency-graph.svg', 'src/'],
      { stdio: 'inherit' },
    );

    // Generate JSON for internal intelligence
    execFileSync('npx', ['--yes', 'madge', '--json', 'src/'], { stdio: 'pipe' });

    console.info('Successfully generated architecture diagrams.');
  } catch (error) {
    console.error('Failed to generate diagrams. Ensure graphviz is installed.', error);
    process.exit(1);
  }
}

generateDiagrams();
