import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';

function analyzeRepo(): void {
  console.info('Generating architecture documentation...');

  fs.mkdirSync('docs/architecture', { recursive: true });

  try {
    // Generate knowledge graph JSON
    execFileSync('npx', ['--yes', 'madge', '--json', 'src/', 'server.ts'], {
      stdio: ['ignore', fs.openSync('docs/architecture/knowledge-graph.json', 'w'), 'pipe']
    });
    console.info('Successfully generated knowledge-graph.json');
  } catch (error: any) {
    console.error('Failed to generate knowledge graph:', error.message || error);
    process.exit(1);
  }

  try {
    // Generate dependency graph SVG
    execFileSync('npx', ['--yes', 'madge', '--image', 'docs/architecture/dependency-graph.svg', 'src/', 'server.ts']);
    console.info('Successfully generated dependency-graph.svg');
  } catch (error: any) {
    console.error('Failed to generate architecture diagram:', error.message || error);
    console.info('Ensure graphviz is installed (e.g., sudo apt-get install -y graphviz).');
    process.exit(1);
  }
}

analyzeRepo();
