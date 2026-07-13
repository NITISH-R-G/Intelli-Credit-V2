import { execFileSync } from 'node:child_process';

function runFixes(): void {
  console.info('Starting self-healing processes...');
  try {
    console.info('Running ESLint fix...');
    execFileSync('npm', ['run', 'lint:fix'], { stdio: 'inherit' });

    console.info('Running Prettier format...');
    execFileSync('npm', ['run', 'format'], { stdio: 'inherit' });

    console.info('Self-healing complete.');
  } catch (error) {
    console.error('Self-healing encountered an error:', error);
    process.exit(1);
  }
}

runFixes();
