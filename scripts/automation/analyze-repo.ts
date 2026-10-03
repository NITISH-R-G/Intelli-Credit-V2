import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';

async function analyze(): Promise<void> {
  try {
    const outDir = path.join(process.cwd(), 'docs', 'architecture');
    fs.mkdirSync(outDir, { recursive: true });

    // Assuming Madge is run separately via the generate scripts, this script can serve to build additional analytics
    // Here we can run a simple stats generation
    const stats = {
      timestamp: new Date().toISOString(),
      status: 'Repository analyzed',
    };

    fs.writeFileSync(path.join(outDir, 'repo-stats.json'), JSON.stringify(stats, null, 2), 'utf-8');
    console.info('Repository statistics generated successfully.');
  } catch (error: unknown) {
    console.error('Error during repository analysis:', error);
    process.exit(1);
  }
}

void analyze();