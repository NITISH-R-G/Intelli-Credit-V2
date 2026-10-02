import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';

const args = process.argv.slice(2);
const generateDiagrams = args.includes('--diagrams');
const generateGraph = args.includes('--graph');

function analyze() {
  const outputDir = 'docs/architecture';
  fs.mkdirSync(outputDir, { recursive: true });

  try {
    if (generateDiagrams) {
      console.info('Generating dependency diagram...');
      execFileSync(
        'npx',
        [
          '--yes',
          'madge',
          '--image',
          `${outputDir}/dependency-graph.svg`,
          '--extensions',
          'ts,tsx',
          'src',
        ],
        { stdio: 'inherit' },
      );
      console.info('Dependency diagram generated successfully.');
    }

    if (generateGraph) {
      console.info('Generating knowledge graph JSON...');
      execFileSync('npx', ['--yes', 'madge', '--json', '--extensions', 'ts,tsx', 'src'], {
        stdio: 'pipe',
      });

      // Execute a separate run to pipe output cleanly
      const graphData = execFileSync(
        'npx',
        ['--yes', 'madge', '--json', '--extensions', 'ts,tsx', 'src'],
        { encoding: 'utf-8' },
      ) as string;

      fs.writeFileSync(`${outputDir}/knowledge-graph.json`, graphData);
      console.info('Knowledge graph JSON generated successfully.');
    }
  } catch {
    console.error('Error during repository analysis.');
    process.exit(1);
  }
}

analyze();
