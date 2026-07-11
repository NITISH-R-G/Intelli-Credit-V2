import { execFileSync } from 'node:child_process';

function main() {
  console.info('Starting continuous improvement loop...');

  try {
    console.info('Running self-healing for formatting and linting (npm run fix)...');
    execFileSync('npm', ['run', 'fix'], { stdio: 'inherit' });
    console.info('Self-healing complete.');

    const diff = execFileSync('git', ['diff']).toString();
    if (diff.trim().length > 0) {
      console.info('Improvements were made. A PR should be opened by the workflow.');
    } else {
      console.info('No improvements necessary. Repository is healthy.');
    }
  } catch (error) {
    console.error('Error during continuous improvement:', error);
  }
}

main();
