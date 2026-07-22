import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';

function analyzeRepo() {
  console.info('Starting repository analysis...');

  try {
    // Basic structural analysis
    console.info('Running typecheck...');
    execFileSync('npx', ['--yes', 'tsc', '--noEmit'], { stdio: 'inherit' });

    console.info('Running linter...');
    execFileSync('npx', ['--yes', 'eslint', '.'], { stdio: 'inherit' });

    console.info('Running unit tests...');
    execFileSync('npx', ['--yes', 'vitest', 'run'], { stdio: 'inherit' });

    console.info('Repository analysis completed successfully. Codebase is healthy.');
  } catch (error) {
    console.error('Repository analysis failed. Please fix the underlying issues.');
    process.exit(1);
  }
}

analyzeRepo();
