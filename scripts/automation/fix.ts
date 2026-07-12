import { execFileSync } from 'node:child_process';

function runCommand(command: string, args: string[]) {
  console.info(`Running: ${command} ${args.join(' ')}`);
  try {
    execFileSync(command, args, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Command failed: ${command} ${args.join(' ')}`, error);
    throw new Error('Fatal Error');
  }
}

console.info('Starting self-healing process...');

// Run auto-formatting
console.info('Formatting code...');
runCommand('npx', ['prettier', '--write', '.']);

// Run lint fixing
console.info('Fixing lint issues...');
runCommand('npx', ['eslint', '.', '--fix']);

console.info('Self-healing process complete.');
