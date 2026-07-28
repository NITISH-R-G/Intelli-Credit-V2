import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

function generateDiagrams(): void {
  console.info('Generating architecture diagrams...');

  const docsDir = 'docs/architecture';
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  try {
    // Note: madge and graphviz must be installed.
    // Use execFileSync to avoid command injection and shell wrapper overhead.
    execFileSync('npx', ['--yes', 'madge', '--image', path.join(docsDir, 'dependency-graph.svg'), 'src/']);
    console.info('Diagram generated at docs/architecture/dependency-graph.svg');

    // Also generate one for the API
    execFileSync('npx', ['--yes', 'madge', '--image', path.join(docsDir, 'api-dependency-graph.svg'), 'api/']);
    console.info('Diagram generated at docs/architecture/api-dependency-graph.svg');
  } catch (e: unknown) {
    console.error('Failed to generate diagrams. Ensure graphviz is installed (e.g., sudo apt-get install -y graphviz).', e);
    // Don't fail the whole workflow if this fails, just log it.
  }
}

generateDiagrams();
