import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';

function analyzeRepo(): void {
  try {
    const outDir = 'docs/architecture';
    fs.mkdirSync(outDir, { recursive: true });

    // Generate diagrams and knowledge graph synchronously using npx --yes tsx
    console.info('Generating diagrams...');
    execFileSync('npx', ['--yes', 'tsx', 'scripts/automation/generate-diagrams.ts'], {
      stdio: 'inherit',
    });

    console.info('Generating knowledge graph...');
    execFileSync('npx', ['--yes', 'tsx', 'scripts/automation/generate-knowledge-graph.ts'], {
      stdio: 'inherit',
    });

    console.info('Repository analysis complete.');
  } catch (error) {
    console.error('Failed to analyze repository:', error);
    process.exit(1);
  }
}

analyzeRepo();
