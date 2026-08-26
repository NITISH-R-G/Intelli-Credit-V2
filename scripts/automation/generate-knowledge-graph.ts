import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';

function generateKnowledgeGraph(): void {
  fs.mkdirSync('docs/architecture', { recursive: true });

  try {
    const output = (
      execFileSync('npx', ['--yes', 'madge', '--json', 'src/']) as unknown as Buffer
    ).toString();
    fs.writeFileSync('docs/architecture/knowledge-graph.json', output);
    console.info('Successfully generated knowledge graph JSON.');
  } catch (error) {
    console.error('Failed to generate knowledge graph JSON.', error);
    process.exit(1);
  }
}

generateKnowledgeGraph();
