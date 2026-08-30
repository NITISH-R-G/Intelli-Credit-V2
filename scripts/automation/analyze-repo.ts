import { execFileSync } from 'node:child_process';

function analyzeRepo(): void {
  try {
    console.info('Starting repository analysis...');

    console.info('Generating Knowledge Graph...');
    execFileSync('npx', ['--yes', 'tsx', 'scripts/automation/generate-knowledge-graph.ts'], {
      stdio: 'inherit',
    });

    console.info('Generating Architecture Diagrams...');
    execFileSync('npx', ['--yes', 'tsx', 'scripts/automation/generate-diagrams.ts'], {
      stdio: 'inherit',
    });

    console.info('Repository analysis complete.');
  } catch (err) {
    console.error('Repository analysis failed:', err);
    process.exit(1);
  }
}

analyzeRepo();
