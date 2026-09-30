import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';

function generateKnowledgeGraph(): void {
  try {
    const outDir = 'docs/architecture';
    fs.mkdirSync(outDir, { recursive: true });

    // Using madge to generate a JSON dependency graph (knowledge graph)
    console.info('Running madge to generate JSON knowledge graph...');
    const result = execFileSync('npx', [
      '--yes',
      'madge',
      '--json',
      '--extensions',
      'ts,tsx',
      'src',
      'api',
      'scripts',
    ]) as unknown as Buffer;

    fs.writeFileSync(`${outDir}/knowledge-graph.json`, result.toString());
    console.info('Knowledge graph generated successfully.');
  } catch (error) {
    console.error('Failed to generate knowledge graph:', error);
    process.exit(1);
  }
}

generateKnowledgeGraph();
