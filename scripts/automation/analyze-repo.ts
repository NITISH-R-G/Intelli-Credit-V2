import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function runAnalysis(): void {
  console.info('Starting full repository analysis...');

  const outDir = path.resolve(process.cwd(), 'docs/architecture');
  fs.mkdirSync(outDir, { recursive: true });

  try {
    console.info('Generating diagrams...');
    execFileSync('npx', ['--yes', 'tsx', 'scripts/automation/generate-diagrams.ts'], { stdio: 'inherit' });

    console.info('Generating knowledge graph...');
    execFileSync('npx', ['--yes', 'tsx', 'scripts/automation/generate-knowledge-graph.ts'], { stdio: 'inherit' });

    console.info('Repository analysis complete.');
  } catch (error) {
    console.error('Error during repository analysis:', error);
    throw error;
  }
}

runAnalysis();
