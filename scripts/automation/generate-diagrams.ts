import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';

function generateDiagrams(): void {
  try {
    const targetDirs = ['src', 'api', 'server.ts'].filter((dir) => fs.existsSync(dir));
    if (targetDirs.length === 0) {
      console.info('No relevant directories found for diagram generation.');
      return;
    }

    console.info('Generating repository dependency diagrams...');
    fs.mkdirSync('docs/architecture', { recursive: true });

    // Use npx --yes to prevent prompts
    execFileSync(
      'npx',
      ['--yes', 'madge', '--image', 'docs/architecture/dependency-graph.svg', ...targetDirs],
      { stdio: 'inherit' },
    );

    console.info('Diagrams saved to docs/architecture/');
  } catch {
    console.error('Failed to generate diagrams');
    process.exit(1);
  }
}

generateDiagrams();
