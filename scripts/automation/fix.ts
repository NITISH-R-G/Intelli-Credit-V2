import { execFileSync } from 'child_process';

function runFix() {
  console.info('Running self-healing checks (format and lint)...');
  let hasError = false;

  try {
    console.info('Running Prettier format...');
    execFileSync('npm', ['run', 'format'], { stdio: 'inherit' });
    console.info('Prettier format completed successfully.');
  } catch (error) {
    console.error('Error during Prettier format:', error);
    hasError = true;
  }

  try {
    console.info('Running ESLint autofix...');
    execFileSync('npm', ['run', 'lint:fix'], { stdio: 'inherit' });
    console.info('ESLint autofix completed successfully.');
  } catch (error) {
    console.error('Error during ESLint autofix:', error);
    hasError = true;
  }

  console.info('Self-healing process finished.');
  if (hasError) {
    process.exitCode = 1;
  }
}

runFix();
