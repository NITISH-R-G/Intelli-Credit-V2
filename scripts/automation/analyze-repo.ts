import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';

const outputDir = 'docs/architecture';

function analyze() {
  fs.mkdirSync(outputDir, { recursive: true });

  try {
    const result = (
      execFileSync('npx', ['--yes', 'madge', '--json', 'src', 'api', 'scripts'], {
        stdio: 'pipe',
      }) as unknown as Buffer
    ).toString();

    fs.writeFileSync(`${outputDir}/knowledge-graph.json`, result, 'utf8');
    console.info('Repository architecture analyzed successfully (JSON output).');
  } catch (error) {
    console.error('Error running madge analysis:', error);
    process.exit(1);
  }
}

analyze();
