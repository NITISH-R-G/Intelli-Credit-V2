import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';

function generateDiagrams(): void {
  console.info('Starting Architecture Diagram Generation...');
  const outDir = path.join('docs', 'architecture');
  fs.mkdirSync(outDir, { recursive: true });

  const targetDirs = ['src', 'api', 'server.ts'];
  const existingTargets = targetDirs.filter((t) => fs.existsSync(t));

  if (existingTargets.length === 0) {
    console.warn('No source files found to generate diagrams.');
    return;
  }

  const outPath = path.join(outDir, 'dependency-graph.svg');

  try {
    const args = ['--yes', 'madge', '--image', outPath, ...existingTargets];
    execFileSync('npx', args, { stdio: 'inherit' });
    console.info(`Successfully generated dependency graph at ${outPath}`);
  } catch (error) {
    console.error('Failed to generate dependency graph with madge:', error);
    process.exit(1);
  }
}

generateDiagrams();
