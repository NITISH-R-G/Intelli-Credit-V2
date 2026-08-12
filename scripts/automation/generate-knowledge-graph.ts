import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function generateKnowledgeGraph(): void {
  const docsDir = path.join('docs', 'architecture');
  fs.mkdirSync(docsDir, { recursive: true });

  console.info('Generating knowledge graph using madge...');

  try {
    const jsonOutput = (
      execFileSync('npx', ['--yes', 'madge', '--json', 'src/']) as unknown as Buffer
    ).toString();

    fs.writeFileSync(path.join(docsDir, 'knowledge-graph.json'), jsonOutput);
    console.info('Knowledge graph generated successfully.');
  } catch (error) {
    console.error('Failed to generate knowledge graph:', error);
    process.exit(1);
  }
}

generateKnowledgeGraph();
