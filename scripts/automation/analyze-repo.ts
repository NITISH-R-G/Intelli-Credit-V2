import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';

function analyzeRepo(): void {
  try {
    console.info('Analyzing repository architecture...');

    // Just a wrapper to run both generation scripts
    execFileSync('npx', ['--yes', 'tsx', 'scripts/automation/generate-diagrams.ts'], { stdio: 'inherit' });
    execFileSync('npx', ['--yes', 'tsx', 'scripts/automation/generate-knowledge-graph.ts'], { stdio: 'inherit' });

    console.info('Repository analysis complete.');
  } catch (error) {
    console.error('Error analyzing repo:', error);
    process.exit(1);
  }
}

analyzeRepo();
