import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

function run() {
  console.info('Analyzing Repository...');

  const docsDir = join(process.cwd(), 'docs');
  if (!existsSync(docsDir)) {
    mkdirSync(docsDir, { recursive: true });
  }

  try {
    const lsFiles = execFileSync('git', ['ls-files'], { encoding: 'utf-8' });
    const count = lsFiles.trim().split('\n').length;

    writeFileSync(
      join(docsDir, 'repo-analysis.md'),
      `# Repository Analysis\n\nAutomatically generated.\n\nTotal tracked files: ${count}`,
    );
    console.info('Analysis complete, written to docs/repo-analysis.md.');
  } catch (error) {
    console.error('Error analyzing repo:', error);
  }
}

run();
