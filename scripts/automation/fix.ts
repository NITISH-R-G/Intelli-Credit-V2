import { execFileSync } from 'child_process';

function runCommand(command: string, args: string[]) {
  try {
    console.info(`Running: ${command} ${args.join(' ')}`);
    execFileSync(command, args, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error running ${command} ${args.join(' ')}:`, error);
    process.exit(1);
  }
}

function main() {
  console.info('Starting self-healing processes...');
  runCommand('npm', ['run', 'format']);
  runCommand('npm', ['run', 'lint:fix']);
  console.info('Self-healing complete.');
}

main();
