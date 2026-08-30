import * as fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import * as path from 'node:path';

function generateKnowledgeGraph(): void {
  const outDir = 'docs/architecture';
  fs.mkdirSync(outDir, { recursive: true });


  try {
    const stdout = execFileSync('npx', ['--yes', 'madge', '--json', 'src/'], {
      encoding: 'utf-8',
    }) as string;
    fs.writeFileSync('docs/architecture/knowledge-graph.json', stdout);
    console.info(`Knowledge graph generated at ${'docs/architecture/knowledge-graph.json'}`);
  } catch (err) {
    console.error('Failed to generate knowledge graph:', err);
    process.exit(1);
  }
}

generateKnowledgeGraph();
