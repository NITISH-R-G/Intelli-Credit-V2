import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

function runSelfHeal() {
  console.info('Starting self-healing process...');

  try {
    console.info('Running formatter (npm run format)...');
    execFileSync('npm', ['run', 'format'], { stdio: 'inherit', cwd: resolve(process.cwd()) });
    console.info('Formatter completed successfully.');
  } catch (error) {
    console.error('Formatter encountered an error:', error.message);
  }

  try {
    console.info('Running linter with auto-fix (npm run lint:fix)...');
    execFileSync('npm', ['run', 'lint:fix'], { stdio: 'inherit', cwd: resolve(process.cwd()) });
    console.info('Linter auto-fix completed successfully.');
  } catch (error) {
    console.error('Linter auto-fix encountered an error:', error.message);
  }

  console.info('Self-healing process finished.');
}

runSelfHeal();
