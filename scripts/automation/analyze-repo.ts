import { execFileSync } from 'node:child_process';

function analyzeRepo(): void {
  try {
    console.info('Starting repository analysis...');

    console.info('Generating diagrams...');
    execFileSync('npx', ['--yes', 'tsx', 'scripts/automation/generate-diagrams.ts'], { stdio: 'inherit' });

    console.info('Generating knowledge graph...');
    execFileSync('npx', ['--yes', 'tsx', 'scripts/automation/generate-knowledge-graph.ts'], { stdio: 'inherit' });

    console.info('Repository analysis complete.');
  } catch (error) {
    console.error('Error analyzing repository:', error);
    process.exit(1);
  }
}

analyzeRepo();
