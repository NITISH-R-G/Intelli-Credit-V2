import { execFileSync } from 'node:child_process';

function selfHeal() {
  console.info('Attempting self-healing...');

  try {
    console.info('Running ESLint autofix...');
    execFileSync('npm', ['run', 'lint:fix'], { stdio: 'inherit' });
  } catch (error) {
    console.warn('Linting fix completed with some errors.');
  }

  try {
    console.info('Running Prettier format...');
    execFileSync('npm', ['run', 'format'], { stdio: 'inherit' });
  } catch (error) {
    console.warn('Formatting completed with some errors.');
  }

  console.info('Self-healing complete.');
}

selfHeal();
