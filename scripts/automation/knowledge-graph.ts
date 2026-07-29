import { execFileSync } from 'child_process';
import * as fs from 'fs';

function generateKnowledgeGraph() {
  try {
    const dir = 'docs/architecture';
    fs.mkdirSync(dir, { recursive: true });

    console.info('Generating knowledge graph using madge...');
    const result = execFileSync('npx', ['--yes', 'madge', '--json', 'src/', 'api/'], {
      encoding: 'utf-8',
    }) as string;
    fs.writeFileSync('docs/architecture/knowledge-graph.json', result);
    console.info('Knowledge graph generated successfully.');
  } catch (error) {
    console.error('Error generating knowledge graph:', error);
  }
}

generateKnowledgeGraph();
