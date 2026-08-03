import * as fs from 'node:fs';
import * as path from 'node:path';

function analyzeRepo(): void {
  console.info('Analyzing repository...');

  // Create directories if they don't exist
  fs.mkdirSync('docs/architecture', { recursive: true });
  fs.mkdirSync('docs/history', { recursive: true });

  const stats = {
    analyzedAt: new Date().toISOString(),
    files: 0,
    directories: 0,
  };

  function walk(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file === 'node_modules' || file === 'dist' || file.startsWith('.')) continue;
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        stats.directories++;
        walk(filePath);
      } else {
        stats.files++;
      }
    }
  }

  walk('.');

  fs.writeFileSync('docs/history/repo-stats.json', JSON.stringify(stats, null, 2), 'utf-8');
  console.info('Repository analysis complete. Stats saved to docs/history/repo-stats.json.');
}

analyzeRepo();
