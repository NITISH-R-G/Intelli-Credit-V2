import { execFileSync } from 'child_process';

function runCommand(command: string, args: string[]) {
  console.info(`Running ${command} ${args.join(' ')}...`);
  try {
    execFileSync(command, args, { stdio: 'inherit' });
    console.info(`Successfully ran ${command} ${args.join(' ')}`);
  } catch (error) {
    console.error(`Error running ${command} ${args.join(' ')}:`, error);
    process.exit(1);
  }
}

function main() {
  console.info('Starting self-healing fix...');
  runCommand('npm', ['run', 'lint:fix']);
  runCommand('npm', ['run', 'format']);
  console.info('Self-healing complete.');
}

main();
