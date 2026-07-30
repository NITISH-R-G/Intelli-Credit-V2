import * as fs from 'fs';
import { execFileSync } from 'child_process';

function generate() {
  console.info('Starting architecture diagram generation with madge...');
  fs.mkdirSync('docs/architecture', { recursive: true });
  fs.mkdirSync('docs/history', { recursive: true });

  try {
    // Requires graphviz to be installed in the OS running this script.
    execFileSync(
      'npx',
      [
        '--yes',
        'madge',
        '--image',
        'docs/architecture/dependency-graph.svg',
        'src/server.ts',
        'src/App.tsx',
        '--extensions',
        'ts,tsx,js,jsx',
      ],
      { stdio: 'inherit' },
    );
    console.info('Successfully generated architecture diagram.');
  } catch (error) {
    console.error('Failed to generate diagram with madge. Ensure graphviz is installed.');
    // Exit gracefully to not block standard workflows if this is just an informational job
    console.warn(error);
  }
}

generate();
