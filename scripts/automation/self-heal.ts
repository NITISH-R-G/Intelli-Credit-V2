import { execFileSync } from 'child_process';

function selfHeal() {
  console.info('Starting self-healing operations...');

  try {
    console.info('Running formatter (Prettier)...');
    execFileSync('npm', ['run', 'format']);
    console.info('Formatter completed successfully.');
  } catch (error) {
    console.warn('Formatter encountered an issue, but continuing...', error);
  }

  try {
    console.info('Running linter auto-fix (ESLint)...');
    execFileSync('npm', ['run', 'lint:fix']);
    console.info('Linter auto-fix completed successfully.');
  } catch (error) {
    // ESLint exits with non-zero code if there are unfixable errors
    console.warn('Linter auto-fix completed with some unresolved issues.');
  }

  console.info('Self-healing operations completed.');
}

selfHeal();
