import { execFileSync } from 'node:child_process';

function runImprovementLoop() {
  console.info('Starting continuous improvement loop...');

  try {
    console.info('Running self-healing fix...');
    execFileSync('npm', ['run', 'fix'], { stdio: 'inherit' });
  } catch (error) {
    console.error('Error during self-healing (npm run fix):', error);
  }

  try {
    console.info('Running repository analysis...');
    execFileSync('npm', ['run', 'analyze:repo'], { stdio: 'inherit' });
  } catch (error) {
    console.error('Error during repository analysis:', error);
  }

  try {
    console.info('Generating diagrams...');
    execFileSync('npm', ['run', 'generate:diagrams'], { stdio: 'inherit' });
  } catch (error) {
    console.error('Error generating diagrams:', error);
  }

  try {
    console.info('Generating knowledge graph...');
    execFileSync('npm', ['run', 'generate:knowledge-graph'], { stdio: 'inherit' });
  } catch (error) {
    console.error('Error generating knowledge graph:', error);
  }

  console.info('Continuous improvement loop completed.');
}

runImprovementLoop();
