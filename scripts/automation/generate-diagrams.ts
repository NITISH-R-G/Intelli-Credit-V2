import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

function generateDiagrams() {
  console.info('Generating architecture diagrams using madge...');
  fs.mkdirSync('docs/architecture', { recursive: true });

  try {
    // We execute madge via npx to generate an image
    // Note: requires graphviz to be installed in the environment (e.g. via apt)
    const args = ['--yes', 'madge', '--image', 'docs/architecture/dependency-graph.svg', 'src/'];
    if (fs.existsSync('server.ts')) {
      args.push('server.ts');
    }
    const output = execFileSync(
      'npx',
      args,
      {
        encoding: 'utf-8',
        stdio: 'pipe',
      },
    ) as string;

    console.info('Diagram generated successfully:', output);
  } catch (err: any) {
    console.warn('Failed to generate diagram. Ensure graphviz is installed.');
    console.error(err.message || err);
  }
}

generateDiagrams();
