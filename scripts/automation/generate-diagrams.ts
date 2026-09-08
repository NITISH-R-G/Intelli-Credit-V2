import * as fs from 'node:fs';
import { execFileSync } from 'node:child_process';

function main(): void {
  console.info('Generating architecture diagrams...');
  try {
    fs.mkdirSync('docs/architecture', { recursive: true });

    // Using execFileSync to run madge
    execFileSync(
      'npx',
      [
        '--yes',
        'madge',
        '--image',
        'docs/architecture/dependency-graph.svg',
        'src',
        'api',
        'server.ts',
      ],
      { stdio: 'inherit' },
    );
    console.info('Successfully generated dependency-graph.svg');
  } catch (error) {
    console.error('Failed to generate diagrams:', error);
    process.exit(1);
  }
}

main();
