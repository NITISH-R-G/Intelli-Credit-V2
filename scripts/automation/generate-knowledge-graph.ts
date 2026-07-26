import fs from 'node:fs';
import path from 'node:path';

function generateKnowledgeGraph(): void {
  console.info('Generating knowledge graph...');

  const outputDir = path.join('docs', 'architecture');
  fs.mkdirSync(outputDir, { recursive: true });

  const outputFile = path.join(outputDir, 'knowledge-graph.json');

  // Simple script to gather package.json info for the graph
  const packageJsonStr = fs.readFileSync('package.json', 'utf8');
  const pkg = JSON.parse(packageJsonStr);

  const graph = {
    nodes: [
      { id: 'Project', label: pkg.name, type: 'Root' },
      { id: 'Dependencies', label: 'Dependencies', type: 'Category' },
      { id: 'DevDependencies', label: 'DevDependencies', type: 'Category' },
      ...(pkg.dependencies ? Object.keys(pkg.dependencies).map(dep => ({ id: dep, label: dep, type: 'Dependency' })) : []),
      ...(pkg.devDependencies ? Object.keys(pkg.devDependencies).map(dep => ({ id: dep, label: dep, type: 'DevDependency' })) : [])
    ],
    edges: [
      { source: 'Project', target: 'Dependencies' },
      { source: 'Project', target: 'DevDependencies' },
      ...(pkg.dependencies ? Object.keys(pkg.dependencies).map(dep => ({ source: 'Dependencies', target: dep })) : []),
      ...(pkg.devDependencies ? Object.keys(pkg.devDependencies).map(dep => ({ source: 'DevDependencies', target: dep })) : [])
    ]
  };

  try {
    fs.writeFileSync(outputFile, JSON.stringify(graph, null, 2), 'utf8');
    console.info(`Knowledge graph generated successfully at ${outputFile}.`);
  } catch (error: any) {
    console.error('Error generating knowledge graph:', error.message || error);
    process.exit(1);
  }
}

generateKnowledgeGraph();
