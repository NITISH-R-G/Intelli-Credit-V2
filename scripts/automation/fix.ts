import { execFileSync } from 'child_process';

function fix() {
  try {
    console.info('Running self-healing fixes...');

    console.info('Running format...');
    const formatOutput = execFileSync('npm', ['run', 'format'], { encoding: 'utf-8' }) as string;
    console.info(formatOutput);

    console.info('Running lint:fix...');
    const lintOutput = execFileSync('npm', ['run', 'lint:fix'], { encoding: 'utf-8' }) as string;
    console.info(lintOutput);

    console.info('Self-healing complete.');
  } catch (error) {
    console.error('Error during self-healing:', error);
    process.exit(1);
  }
}

fix();
