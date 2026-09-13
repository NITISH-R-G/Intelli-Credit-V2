import * as fs from 'node:fs';
import { execFileSync } from 'node:child_process';

function runAnalysis() {
  console.info('Running repository architecture analysis...');
  const outDir = 'docs/architecture';
  fs.mkdirSync(outDir, { recursive: true });

  try {
    console.info('Generating JSON knowledge graph...');
    const output = execFileSync('npx', ['--yes', 'madge', '--json', 'src/', 'api/'], {
      encoding: 'utf-8',
    }) as string;
    fs.writeFileSync(`${outDir}/knowledge-graph.json`, output);
    console.info('Knowledge graph saved successfully.');
  } catch (error) {
    console.error('Error generating knowledge graph:', error);
  }
}

runAnalysis();
