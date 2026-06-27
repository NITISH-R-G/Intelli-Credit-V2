import { execFileSync } from 'node:child_process';

function runCommand(command: string, args: string[]) {
  console.info(`Running: ${command} ${args.join(' ')}`);
  try {
    execFileSync(command, args, { stdio: 'inherit' });
  } catch {
    console.error(`Error running ${command} ${args.join(' ')}`);
    // Depending on strictness, we might throw or continue. Continuing for self-healing.
  }
}

function main() {
  console.info('Starting self-healing process...');

  runCommand('npm', ['run', 'lint:fix']);
  runCommand('npm', ['run', 'format']);

  // Try audit fix for security
  runCommand('npm', ['audit', 'fix']);

  console.info('Self-healing process complete.');
}

main();
