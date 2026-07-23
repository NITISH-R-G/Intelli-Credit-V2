import { globSync } from 'glob';
import * as fs from 'fs';
import * as path from 'path';

function generateKnowledgeGraph() {
  console.info('Starting knowledge graph generation...');
  const outDir = path.join(process.cwd(), 'docs', 'architecture');
  fs.mkdirSync(outDir, { recursive: true });

  const files = globSync('src/**/*.{ts,tsx,js,jsx}');

  const graph = {
    nodes: files.map(f => ({ id: f, type: 'file' })),
    edges: []
  };

  const outPath = path.join(outDir, 'knowledge-graph.json');
  fs.writeFileSync(outPath, JSON.stringify(graph, null, 2));
  console.info(`Knowledge graph saved to ${outPath}`);
}

generateKnowledgeGraph();
