import { execFileSync } from 'node:child_process';

function selfHeal(): void {
  try {
    console.info('Running ESLint fix...');
    execFileSync('npx', ['--yes', 'eslint', '.', '--fix']);
    console.info('ESLint fix completed.');
  } catch (error) {
    console.error('ESLint fix failed:', error);
  }

  try {
    console.info('Running Prettier write...');
    execFileSync('npx', ['--yes', 'prettier', '--write', '.']);
    console.info('Prettier write completed.');
  } catch (error) {
    console.error('Prettier write failed:', error);
  }
}

selfHeal();
