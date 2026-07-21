import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';

const docsDir = 'docs/architecture';
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

function analyzeRepo() {
  try {
    console.info('Starting repository analysis...');

    // Example logic: Count files by extension
    const allFilesOutput = execFileSync('git', ['ls-files'], { encoding: 'utf-8' }) as string;
    const files = allFilesOutput.split('\n').filter(Boolean);

    const stats = {
      totalFiles: files.length,
      tsFiles: files.filter((f) => f.endsWith('.ts') || f.endsWith('.tsx')).length,
      jsFiles: files.filter((f) => f.endsWith('.js') || f.endsWith('.jsx')).length,
      mdFiles: files.filter((f) => f.endsWith('.md')).length,
      jsonFiles: files.filter((f) => f.endsWith('.json')).length,
      timestamp: new Date().toISOString(),
    };

    const reportPath = path.join(docsDir, 'repo-stats.json');
    fs.writeFileSync(reportPath, JSON.stringify(stats, null, 2));
    console.info(`Repository stats successfully written to ${reportPath}`);
  } catch (error) {
    console.error('Failed to analyze repository:', error);
    process.exit(1);
  }
}

void analyzeRepo();
