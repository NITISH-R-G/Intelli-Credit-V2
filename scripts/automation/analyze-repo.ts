import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';

const historyDir = path.join(process.cwd(), 'docs', 'history');

// Ensure history directory exists
fs.mkdirSync(historyDir, { recursive: true });

function analyzeRepo() {
  console.info('Starting repository analysis...');
  try {
    const loc = execFileSync('npx', ['--yes', 'cloc', '--json', 'src', 'api'], { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const reportPath = path.join(historyDir, `repo-analysis-${timestamp}.json`);

    fs.writeFileSync(reportPath, loc, 'utf-8');
    console.info(`Repository analysis complete. Report saved to ${reportPath}`);
  } catch (error) {
    console.error('Error during repository analysis:', error);
    // Exit gracefully so CI doesn't completely fail if cloc isn't installed
    process.exit(0);
  }
}

analyzeRepo();
