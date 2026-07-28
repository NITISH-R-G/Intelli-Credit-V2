import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

function generateKnowledgeGraph(): void {
  console.info('Generating repository knowledge graph...');

  const docsDir = 'docs/architecture';
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  try {
    // We can use madge to dump the JSON representation of the graph
    const graphData = (execFileSync('npx', ['--yes', 'madge', '--json', 'src/', 'api/']) as unknown as Buffer).toString();
    fs.writeFileSync(path.join(docsDir, 'knowledge-graph.json'), graphData);
    console.info('Knowledge graph generated at docs/architecture/knowledge-graph.json');
  } catch (e: unknown) {
    console.warn('Failed to generate knowledge graph.', e);
  }
}

generateKnowledgeGraph();
