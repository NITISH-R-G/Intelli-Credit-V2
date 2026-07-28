import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

function analyzeRepo(): void {
  console.info('Starting repository analysis...');

  const docsDir = 'docs/architecture';
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  try {
    const sloc = (execFileSync('npx', ['--yes', 'sloc', 'src/', 'api/']) as unknown as Buffer).toString();
    fs.writeFileSync(path.join(docsDir, 'sloc-report.txt'), sloc);
    console.info('SLOC analysis saved.');
  } catch (e: unknown) {
    console.warn('Failed to run SLOC analysis, skipping.', e);
  }

  console.info('Repository analysis complete.');
}

analyzeRepo();
