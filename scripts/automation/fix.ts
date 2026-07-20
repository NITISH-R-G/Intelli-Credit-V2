import { execFileSync } from 'child_process';

function runFix() {
  console.info('Running self-healing auto-fix tasks...');

  try {
    console.info('Formatting with Prettier...');
    execFileSync('npx', ['prettier', '--write', '.'], { stdio: 'inherit' });

    console.info('Linting and fixing with ESLint...');
    execFileSync('npx', ['eslint', '.', '--fix'], { stdio: 'inherit' });

    console.info('Self-healing tasks completed successfully.');
  } catch (error) {
    console.error('Error during self-healing tasks:', error);
    process.exit(1);
  }
}

runFix();
