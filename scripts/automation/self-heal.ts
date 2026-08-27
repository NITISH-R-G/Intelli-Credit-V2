import { execFileSync } from 'node:child_process';

function main() {
  console.info('Running self-healing process...');

  try {
    console.info('Running ESLint autofix...');
    execFileSync('npm', ['run', 'lint:fix']);
  } catch (err) {
    console.warn('ESLint autofix reported issues that could not be automatically fixed.');
  }

  try {
    console.info('Running Prettier format...');
    execFileSync('npm', ['run', 'format']);
  } catch (err) {
    console.error('Prettier formatting failed:', err);
    process.exit(1);
  }

  console.info('Self-healing process complete.');
}

main();
