import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

function generateKnowledgeGraph() {
  console.info('Generating knowledge graph...');

  const graph: { nodes: any[]; edges: any[] } = { nodes: [], edges: [] };
  let nodeId = 1;

  function walkDir(dir: string, parentId: number | null) {
    const files = readdirSync(dir);
    for (const file of files) {
      if (file === 'node_modules' || file === '.git' || file === 'dist') continue;

      const fullPath = join(dir, file);
      const stat = statSync(fullPath);
      const currentId = nodeId++;

      graph.nodes.push({
        id: currentId,
        label: file,
        path: fullPath,
        type: stat.isDirectory() ? 'directory' : 'file',
      });

      if (parentId !== null) {
        graph.edges.push({ from: parentId, to: currentId, type: 'contains' });
      }

      if (stat.isDirectory()) {
        walkDir(fullPath, currentId);
      }
    }
  }

  walkDir('.', null);

  try {
    writeFileSync('docs/knowledge-graph.json', JSON.stringify(graph, null, 2));
    console.info('Knowledge graph saved to docs/knowledge-graph.json');
  } catch (error) {
    console.error('Failed to write knowledge graph:', error);
  }
}

generateKnowledgeGraph();
