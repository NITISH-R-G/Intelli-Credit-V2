import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';

function generateDiagrams(): void {
  const outputDir = 'docs/architecture';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'dependency-graph.svg');

  try {
    console.info('Generating dependency graph...');
    execFileSync('npx', ['--yes', 'madge', '--image', outputPath, 'src/', 'api/'], {
      encoding: 'utf-8',
    });
    console.info(`Successfully generated dependency graph at ${outputPath}`);
  } catch (error) {
    console.error('Failed to generate dependency graph. Ensure graphviz is installed.', error);
    process.exit(1);
  }
}

generateDiagrams();
