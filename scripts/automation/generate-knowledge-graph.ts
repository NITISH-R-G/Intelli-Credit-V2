import fs from 'fs';
import path from 'path';

interface KnowledgeGraph {
  nodes: { id: string; group: number; label: string }[];
  links: { source: string; target: string; value: number }[];
}

const mapDirectoryToNodes = (
  dir: string,
  basePath: string = '',
  nodes: any[],
  links: any[],
  parentId: string | null = null,
  depth: number = 0,
  maxDepth: number = 4,
) => {
  if (depth > maxDepth) return;
  const items = fs.readdirSync(dir);

  for (const item of items) {
    if (['node_modules', '.git', 'dist', 'build', 'docs'].includes(item)) continue;

    const fullPath = path.join(dir, item);
    const relPath = path.join(basePath, item);
    const stat = fs.statSync(fullPath);
    const id = relPath;

    nodes.push({ id, group: stat.isDirectory() ? 1 : 2, label: item });

    if (parentId) {
      links.push({ source: parentId, target: id, value: 1 });
    }

    if (stat.isDirectory()) {
      mapDirectoryToNodes(fullPath, relPath, nodes, links, id, depth + 1, maxDepth);
    } else {
      // basic dependency linking for TS/JS
      if (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const imports = content.match(/import.*from\s+['"]([^'"]+)['"]/g) || [];
          for (const imp of imports) {
            const match = imp.match(/from\s+['"]([^'"]+)['"]/);
            if (match && match[1]) {
              const impPath = match[1];
              if (impPath.startsWith('.')) {
                // try resolving relative
                const targetPath = path.join(dir, impPath);
                const targetRel = path.relative(process.cwd(), targetPath);

                let resolvedTarget = targetRel;
                if (fs.existsSync(targetPath + '.ts')) resolvedTarget += '.ts';
                else if (fs.existsSync(targetPath + '.tsx')) resolvedTarget += '.tsx';
                else if (fs.existsSync(targetPath + '.js')) resolvedTarget += '.js';
                else if (fs.existsSync(targetPath + '/index.ts')) resolvedTarget += '/index.ts';

                links.push({ source: id, target: resolvedTarget, value: 2 });
              } else {
                // External dep
                const extId = `ext:${impPath}`;
                if (!nodes.find((n) => n.id === extId)) {
                  nodes.push({ id: extId, group: 3, label: impPath });
                }
                links.push({ source: id, target: extId, value: 1 });
              }
            }
          }
        } catch (e) {
          // Ignore read errors
        }
      }
    }
  }
};

const main = () => {
  console.log('Generating Knowledge Graph...');

  const graph: KnowledgeGraph = { nodes: [], links: [] };

  graph.nodes.push({ id: 'root', group: 0, label: 'Repository Root' });

  mapDirectoryToNodes(process.cwd(), '', graph.nodes, graph.links, 'root');

  const outDir = path.resolve(process.cwd(), 'docs');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, 'knowledge-graph.json');
  fs.writeFileSync(outPath, JSON.stringify(graph, null, 2));

  console.log(`Knowledge Graph generated successfully at ${outPath}`);
};

main();
