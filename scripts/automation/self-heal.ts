import { execFileSync } from 'child_process';

function selfHeal() {
  console.info('Starting self-healing routines...');

  try {
    console.info('Running formatter...');
    const formatOut = execFileSync('npm', ['run', 'format'], { encoding: 'utf-8' }) as string;
    console.info(formatOut);

    console.info('Running linter auto-fix...');
    const lintOut = execFileSync('npm', ['run', 'lint:fix'], { encoding: 'utf-8' }) as string;
    console.info(lintOut);

    console.info('Self-healing complete.');
  } catch (error) {
    console.warn('Self-healing encountered an issue. See logs below:');
    if (error && typeof error === 'object' && 'stdout' in error) {
      console.error((error as { stdout: string }).stdout);
    }
    // We exit 0 because self-heal shouldn't break CI, it's just best effort
    ;
  }
}

selfHeal();
