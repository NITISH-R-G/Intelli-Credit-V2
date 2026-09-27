import { execFileSync } from 'node:child_process';

function analyzeRepo(): void {
  try {
    console.info('Starting full repository analysis...');

    // Generate Knowledge Graph
    execFileSync('npx', ['--yes', 'tsx', 'scripts/automation/generate-knowledge-graph.ts'], { stdio: 'inherit' });

    // Generate Diagrams
    execFileSync('npx', ['--yes', 'tsx', 'scripts/automation/generate-diagrams.ts'], { stdio: 'inherit' });

    console.info('Repository analysis complete.');
  } catch (error) {
    console.error('Repository analysis failed', error);
    process.exit(1);
  }
}

analyzeRepo();
