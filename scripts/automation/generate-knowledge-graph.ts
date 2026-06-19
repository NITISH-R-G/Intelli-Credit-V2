import fs from 'fs';
import path from 'path';

interface Node {
  id: string;
  label: string;
  type: 'file' | 'module' | 'dependency';
}

interface Edge {
  source: string;
  target: string;
  type: 'depends_on' | 'contains';
}

const mapDirectoryToNodesAndEdges = (
  dir: string,
  baseDir: string,
  nodes: Node[],
  edges: Edge[],
) => {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    if (['node_modules', '.git', 'dist', 'build'].includes(item)) continue;

    const fullPath = path.join(dir, item);
    const relativePath = path.relative(baseDir, fullPath);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      nodes.push({ id: relativePath, label: item, type: 'module' });
      // Link parent module to this module
      if (dir !== baseDir) {
        const parentRelativePath = path.relative(baseDir, dir);
        edges.push({ source: parentRelativePath, target: relativePath, type: 'contains' });
      } else {
        edges.push({ source: 'root', target: relativePath, type: 'contains' });
      }
      mapDirectoryToNodesAndEdges(fullPath, baseDir, nodes, edges);
    } else {
      nodes.push({ id: relativePath, label: item, type: 'file' });
      const parentRelativePath = dir === baseDir ? 'root' : path.relative(baseDir, dir);
      edges.push({ source: parentRelativePath, target: relativePath, type: 'contains' });
    }
  }
};

const main = () => {
  console.info('Generating Repository Knowledge Graph...');

  const nodes: Node[] = [{ id: 'root', label: 'Repository Root', type: 'module' }];
  const edges: Edge[] = [];

  const baseDir = process.cwd();

  // 1. Map files and directories
  mapDirectoryToNodesAndEdges(baseDir, baseDir, nodes, edges);

  // 2. Add dependencies from package.json
  const pkgPath = path.resolve(baseDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

    for (const dep of Object.keys(allDeps)) {
      const depId = `dep_${dep}`;
      nodes.push({ id: depId, label: dep, type: 'dependency' });
      edges.push({ source: 'root', target: depId, type: 'depends_on' });
    }
  }

  const graphData = { nodes, edges };

  const outDir = path.resolve(process.cwd(), 'docs/architecture');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const graphPath = path.join(outDir, 'knowledge-graph.json');
  fs.writeFileSync(graphPath, JSON.stringify(graphData, null, 2));

  // Also generate a simple markdown representation
  let mdContent = '# Repository Knowledge Graph\n\n## Modules and Files\n\n';
  edges
    .filter((e) => e.type === 'contains')
    .forEach((e) => {
      mdContent += `- **${e.source}** contains \`${e.target}\`\n`;
    });

  mdContent += '\n## Dependencies\n\n';
  edges
    .filter((e) => e.type === 'depends_on')
    .forEach((e) => {
      mdContent += `- **${e.source}** depends on \`${e.target.replace('dep_', '')}\`\n`;
    });

  const mdPath = path.join(outDir, 'KNOWLEDGE_GRAPH.md');
  fs.writeFileSync(mdPath, mdContent);

  console.info(`Knowledge Graph generated successfully at ${graphPath}`);
};

main();
