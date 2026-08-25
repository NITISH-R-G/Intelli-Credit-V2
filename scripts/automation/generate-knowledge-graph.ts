import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';

const outputDir = 'docs/architecture';

function generateGraph() {
  fs.mkdirSync(outputDir, { recursive: true });

  try {
    const result = (
      execFileSync('npx', ['--yes', 'madge', '--json', 'src', 'api', 'scripts'], {
        stdio: 'pipe',
      }) as unknown as Buffer
    ).toString();

    fs.writeFileSync(`${outputDir}/knowledge-graph.json`, result, 'utf8');
    console.info('Knowledge graph generated successfully.');
  } catch (error) {
    console.error('Error generating knowledge graph:', error);
    process.exit(1);
  }
}

generateGraph();
