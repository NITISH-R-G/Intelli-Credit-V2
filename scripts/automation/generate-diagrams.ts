import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function generateDiagrams(): void {
  const docsDir = path.join(process.cwd(), 'docs', 'architecture');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  try {
    console.info('Generating architecture diagrams using madge...');
    // Utilizing madge to create a dependency graph image
    // Note: requires graphviz to be installed on the system (e.g. sudo apt-get install graphviz)
    execFileSync('npx', ['--yes', 'madge', '--image', path.join(docsDir, 'dependency-graph.svg'), 'src/'], { stdio: 'inherit' });
    console.info('Successfully generated dependency diagram.');
  } catch (error) {
    console.error('Error generating diagrams:', error);
    process.exit(1);
  }
}

generateDiagrams();
