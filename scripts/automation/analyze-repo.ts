import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';

function analyzeRepo(): void {
  const repoRoot = process.cwd();
  const outputDir = path.join(repoRoot, 'docs', 'architecture');

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  const svgPath = path.join(outputDir, 'dependency-graph.svg');
  const jsonPath = path.join(outputDir, 'knowledge-graph.json');
  const srcDir = path.join(repoRoot, 'src');

  if (!fs.existsSync(srcDir)) {
    console.warn('src directory not found. Skipping analysis.');
    return;
  }

  try {
    console.info('Generating architecture dependency graph (SVG)...');
    execFileSync('npx', ['--yes', 'madge', '--image', svgPath, srcDir], { stdio: 'inherit' });

    console.info('Generating knowledge graph (JSON)...');
    execFileSync('npx', ['--yes', 'madge', '--json', jsonPath, srcDir], { stdio: 'inherit' });

    console.info('Repository analysis completed successfully.');
  } catch (err: unknown) {
    console.error('Failed to generate architecture diagrams:', err);
    process.exit(1);
  }
}

analyzeRepo();
