import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

function analyzeRepo() {
  let repoTree = '';
  try {
    repoTree = execFileSync('git', ['ls-files'], { encoding: 'utf-8' }) as string;
  } catch (err) {
    console.error('Failed to list repository files', err);
    repoTree = 'Could not retrieve repository tree.';
  }

  const report = `# Repository Analysis Report\n\nGenerated automatically on ${new Date().toISOString()}.\n\n## Repository Files\n\`\`\`\n${repoTree}\n\`\`\`\n`;

  fs.mkdirSync('docs/architecture', { recursive: true });
  fs.writeFileSync('docs/architecture/repo-analysis.md', report);
  console.info('Repository analysis report generated.');
}

analyzeRepo();
