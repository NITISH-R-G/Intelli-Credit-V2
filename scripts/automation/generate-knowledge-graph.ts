import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';

function generateKnowledgeGraph(): void {
  console.info('Starting Knowledge Graph Generation...');
  const outDir = path.join('docs', 'architecture');
  fs.mkdirSync(outDir, { recursive: true });

  const targetDirs = ['src', 'api', 'server.ts'];
  const existingTargets = targetDirs.filter((t) => fs.existsSync(t));

  if (existingTargets.length === 0) {
    console.warn('No source files found to generate knowledge graph.');
    return;
  }

  try {
    const args = ['--yes', 'madge', '--json', ...existingTargets];
    // Madge prints JSON to stdout when --json is used.
    const jsonOutput = (execFileSync('npx', args) as unknown as Buffer).toString();

    const outPath = path.join(outDir, 'knowledge-graph.json');
    fs.writeFileSync(outPath, jsonOutput);
    console.info(`Successfully generated knowledge graph at ${outPath}`);
  } catch (error) {
    console.error(
      'Failed to generate knowledge graph with madge:',
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }
}

generateKnowledgeGraph();
