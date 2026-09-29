import { execFileSync } from 'node:child_process';

function selfHeal(): void {
  console.info('Running self-healing sequence...');

  try {
    const output = execFileSync('npm', ['run', 'fix'], { encoding: 'utf-8' }) as string;
    console.info('Self-healing complete:\n', output);
  } catch (error) {
    console.error('Self-healing encountered an issue:', error);
    process.exitCode = 1;
  }
}

selfHeal();
