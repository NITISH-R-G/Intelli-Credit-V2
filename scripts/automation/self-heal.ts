import { execFileSync } from 'node:child_process';

function runSelfHeal() {
  console.info('Starting self-healing process...');

  try {
    console.info('Running lint:fix...');
    const resultLint = execFileSync('npm', ['run', 'lint:fix'], { stdio: 'inherit', encoding: 'utf-8' });
    if (resultLint) console.info(resultLint);
  } catch (error) {
    console.error('lint:fix failed:', error);
  }

  try {
    console.info('Running format...');
    const resultFormat = execFileSync('npm', ['run', 'format'], { stdio: 'inherit', encoding: 'utf-8' });
    if (resultFormat) console.info(resultFormat);
  } catch (error) {
    console.error('format failed:', error);
  }

  console.info('Self-healing process completed.');
}

runSelfHeal();
