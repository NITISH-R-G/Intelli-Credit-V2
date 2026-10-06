import * as fs from 'node:fs';
import { execFileSync } from 'node:child_process';

function analyzeRepo() {
  console.info('Starting repository analysis...');

  try {
    // Check if madge is installed, if not we assume it is run via npx
    fs.mkdirSync('docs/architecture', { recursive: true });

    // Using explicit string casting as per instructions for execFileSync
    const madgeOutput = (execFileSync('npx', ['--yes', 'madge', '--json', '--extensions', 'ts,tsx', 'src', 'api']) as unknown as Buffer).toString();

    fs.writeFileSync('docs/architecture/knowledge-graph.json', madgeOutput);
    console.info('Knowledge graph generated at docs/architecture/knowledge-graph.json');

    // We run the diagram generation via npm script usually, but we can do it here too if needed,
    // but the diagram generation needs graphviz which might not be installed here.
    // The instructions say madge requires graphviz. We will leave diagram generation to the npm script
    // which can be run in an environment where graphviz is present.

    console.info('Repository analysis complete.');
  } catch (err) {
    console.error('Error during repository analysis:', err);
    process.exit(1);
  }
}

analyzeRepo();
