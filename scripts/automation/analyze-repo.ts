import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

function analyze() {
  const outputDir = path.join('docs', 'architecture');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  process.stdout.write('Generating dependency graph...\n');
  try {
    execFileSync(
      'npx',
      [
        '--yes',
        'madge',
        '--image',
        path.join(outputDir, 'dependency-graph.svg'),
        '--extensions',
        'ts,tsx,js,jsx',
        'src',
      ],
      { stdio: 'inherit' },
    );
    process.stdout.write('Dependency graph generated successfully.\n');
  } catch (error) {
    process.stderr.write(
      `Failed to generate dependency graph: ${error instanceof Error ? error.message : 'Unknown error'}\n`,
    );
    // Non-fatal, continue with knowledge graph
  }

  process.stdout.write('Generating knowledge graph JSON...\n');
  try {
    execFileSync(
      'npx',
      [
        '--yes',
        'madge',
        '--json',
        path.join(outputDir, 'knowledge-graph.json'),
        '--extensions',
        'ts,tsx,js,jsx',
        'src',
      ],
      { stdio: 'inherit' },
    );
    process.stdout.write('Knowledge graph JSON generated successfully.\n');
  } catch (error) {
    process.stderr.write(
      `Failed to generate knowledge graph JSON: ${error instanceof Error ? error.message : 'Unknown error'}\n`,
    );
    process.exit(1);
  }
}

analyze();
