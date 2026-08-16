import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

function generateDiagrams(): void {
  const docsDir = 'docs/architecture';
  fs.mkdirSync(docsDir, { recursive: true });

  const outputFile = path.join(docsDir, 'dependency-graph.svg');

  try {
    console.info('Generating architecture diagrams using madge...');
    // We use execFileSync with an array of arguments to prevent command injection
    // Using npx --yes madge to ensure interactive prompts are skipped in CI
    execFileSync('npx', ['--yes', 'madge', '--image', outputFile, 'src/', 'api/'], {
      stdio: 'inherit',
      encoding: 'utf-8',
    });
    console.info(\`Diagram successfully generated at \${outputFile}\`);
  } catch (error) {
    console.error('Failed to generate architecture diagrams with madge:', error);
    process.exit(1);
  }
}

generateDiagrams();
