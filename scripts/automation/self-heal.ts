import { execFileSync } from 'node:child_process';

function runSelfHeal() {
  console.info('Starting self-healing process...');

  try {
    console.info('Running lint:fix...');
    execFileSync('npm', ['run', 'lint:fix'], { stdio: 'inherit', encoding: 'utf-8' });
  } catch (error) {
    console.error('lint:fix failed:', error);
  }

  try {
    console.info('Running format...');
    execFileSync('npm', ['run', 'format'], { stdio: 'inherit', encoding: 'utf-8' });
  } catch (error) {
    console.error('format failed:', error);
  }

  console.info('Self-healing process completed.');
}

runSelfHeal();
