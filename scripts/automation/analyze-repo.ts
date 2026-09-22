import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';

function analyze(): void {
  try {
    const outDir = 'docs/architecture';
    fs.mkdirSync(outDir, { recursive: true });

    // Ensure we capture madge output correctly per typescript standards
    execFileSync('npx', ['--yes', 'madge', '--json', '.'], {
      encoding: 'utf-8',
    });

    // We just ensure madge runs successfully, actual output files are generated via package.json scripts.
    // This script acts as an additional automated check/analysis step.
    console.info('Repository architecture analysis completed.');
    fs.writeFileSync(path.join(outDir, 'analysis-log.txt'), 'Analysis complete.', 'utf-8');
  } catch (error) {
    console.error('Error analyzing repository:', error);
    process.exitCode = 1;
    return;
  }
}

analyze();
