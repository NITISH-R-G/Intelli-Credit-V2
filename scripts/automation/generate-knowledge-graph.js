import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

function runGenerateKnowledgeGraph() {
  console.info('Starting knowledge graph generation...');
  const graphPath = join(process.cwd(), 'docs', 'knowledge-graph.json');

  try {
    mkdirSync(dirname(graphPath), { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      console.error('Failed to create docs directory:', error.message);
      process.exit(1);
    }
  }

  const content = JSON.stringify(
    {
      nodes: [
        { id: 'api', type: 'module', description: 'Backend functions' },
        { id: 'src', type: 'module', description: 'Frontend code' },
      ],
      edges: [{ source: 'src', target: 'api', relation: 'calls' }],
    },
    null,
    2,
  );

  try {
    writeFileSync(graphPath, content, 'utf8');
    console.info('Knowledge graph saved to ' + graphPath);
  } catch (error) {
    console.error('Failed to write knowledge graph:', error.message);
  }
}

runGenerateKnowledgeGraph();
