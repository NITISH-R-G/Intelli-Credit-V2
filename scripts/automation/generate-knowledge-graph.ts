import fs from 'fs';
import path from 'path';

interface Node {
  id: string;
  label: string;
  type: string;
}

interface Edge {
  source: string;
  target: string;
  relation: string;
}

interface KnowledgeGraph {
  nodes: Node[];
  edges: Edge[];
}

const buildGraphFromStructure = (
  structure: any,
  parentId: string,
  nodes: Node[],
  edges: Edge[],
) => {
  for (const [key, value] of Object.entries(structure)) {
    const id = `${parentId}/${key}`;
    const type = typeof value === 'object' && value !== null ? 'directory' : 'file';

    nodes.push({ id, label: key, type });
    edges.push({ source: parentId, target: id, relation: 'contains' });

    if (type === 'directory') {
      buildGraphFromStructure(value, id, nodes, edges);
    }
  }
};

const main = () => {
  console.info('Generating Knowledge Graph...');

  const metadataPath = path.resolve(process.cwd(), 'metadata.json');
  if (!fs.existsSync(metadataPath)) {
    console.warn('metadata.json not found. Cannot generate knowledge graph.');
    return;
  }

  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Root node
  const rootId = 'root';
  nodes.push({ id: rootId, label: metadata.name || 'Repository Root', type: 'repository' });

  if (metadata.structure) {
    buildGraphFromStructure(metadata.structure, rootId, nodes, edges);
  }

  // Add dependency nodes and edges
  if (metadata.dependencies) {
    for (const dep of Object.keys(metadata.dependencies)) {
      const depId = `dep:${dep}`;
      nodes.push({ id: depId, label: dep, type: 'dependency' });
      edges.push({ source: rootId, target: depId, relation: 'depends_on' });
    }
  }

  const graph: KnowledgeGraph = { nodes, edges };

  const outDir = path.resolve(process.cwd(), 'docs');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(path.join(outDir, 'knowledge-graph.json'), JSON.stringify(graph, null, 2));
  console.info('Knowledge Graph generated successfully at docs/knowledge-graph.json.');
};

main();
