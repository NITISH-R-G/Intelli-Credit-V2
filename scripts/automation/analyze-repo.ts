import * as fs from 'node:fs';
import { execFileSync } from 'node:child_process';

async function analyze() {
  const outputDir = 'docs/architecture';
  fs.mkdirSync(outputDir, { recursive: true });

  console.log('Generating architecture diagrams and knowledge graph...');

  try {
    execFileSync(
      'npx',
      ['--yes', 'madge', '--image', `${outputDir}/dependency-graph.svg`, 'src/'],
      { encoding: 'utf-8' },
    );
    execFileSync('npx', ['--yes', 'madge', '--json', `${outputDir}/knowledge-graph.json`, 'src/'], {
      encoding: 'utf-8',
    });
    console.log('Analysis complete.');
  } catch (err) {
    console.error('Error generating analysis:', err);
    process.exit(1);
  }
}

await analyze().catch(() => process.exit(1));
