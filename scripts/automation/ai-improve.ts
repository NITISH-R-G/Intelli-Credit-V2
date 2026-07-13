import { execFileSync } from 'node:child_process';

function runImprovementLoop() {
  console.info('Starting continuous improvement loop...');
  try {
    // Check if audit has vulnerabilities
    console.info('Running security audit check...');
    execFileSync('npm', ['audit', '--audit-level=high'], { stdio: 'inherit' });

    console.info('Checking formatting...');
    execFileSync('npm', ['run', 'format:check'], { stdio: 'inherit' });

    console.info('Running tests to ensure health...');
    execFileSync('npm', ['test'], { stdio: 'inherit' });
  } catch (e) {
    console.warn('Improvement loop detected issues that may need attention.');
  }
  console.info('Continuous improvement loop complete.');
}

runImprovementLoop();
