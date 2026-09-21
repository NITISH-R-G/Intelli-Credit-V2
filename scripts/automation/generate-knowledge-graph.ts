import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';

function generateKnowledgeGraph(): void {
  try {
    fs.mkdirSync('docs/architecture', { recursive: true });
    console.info('Generating knowledge graph with madge...');
    const output = execFileSync('npx', ['--yes', 'madge', '--json', 'src/'], {
      encoding: 'utf-8',
    }) as unknown as string;
    fs.writeFileSync('docs/architecture/knowledge-graph.json', output);
    console.info('Successfully generated knowledge-graph.json');
  } catch (error) {
    console.error('Error generating knowledge graph:', error);
    process.exit(1);
  }
}

generateKnowledgeGraph();
