import { execFileSync } from 'node:child_process';

function selfHeal(): void {
  try {
    const stdout = execFileSync('npm', ['run', 'fix'], { encoding: 'utf-8' }) as string;
    process.stdout.write(stdout);
  } catch (error) {
    if (error instanceof Error) {
      process.stderr.write(error.message);
    }
    process.exit(1);
  }
}

selfHeal();
