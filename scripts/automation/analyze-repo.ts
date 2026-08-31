import * as fs from 'node:fs';
import { execFileSync } from 'node:child_process';

function analyzeRepo(): void {
  fs.mkdirSync('docs/architecture', { recursive: true });

  console.info('Generating knowledge graph JSON...');
  try {
    const jsonOutput = (execFileSync('npx', ['--yes', 'madge', './src', './api', '--json']) as unknown as Buffer).toString('utf-8');
    fs.writeFileSync('docs/architecture/knowledge-graph.json', jsonOutput);
    console.info('Knowledge graph saved to docs/architecture/knowledge-graph.json');
  } catch (error) {
    console.error('Failed to generate knowledge graph:', error);
  }

  console.info('Generating dependency graph SVG...');
  try {
    const svgOutput = (execFileSync('npx', ['--yes', 'madge', './src', './api', '--image', 'docs/architecture/dependency-graph.svg']) as unknown as Buffer).toString('utf-8');
    if (svgOutput) {
      console.info('Dependency graph saved to docs/architecture/dependency-graph.svg');
    }
  } catch (error) {
    console.error('Failed to generate dependency graph SVG:', error);
  }
}

analyzeRepo();
