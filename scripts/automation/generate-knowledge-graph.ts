import * as fs from 'fs';
import * as path from 'path';

// A simple script to simulate knowledge graph generation
// In a fully developed repo, this would parse ASTs or use Gemini to build a true graph.
// Here we do a structural map as a JSON file.

function getDirectoryStructure(
  dir: string,
  exclude: string[] = ['node_modules', 'dist', '.git'],
): any {
  const stats = fs.statSync(dir);
  if (!stats.isDirectory()) {
    return { type: 'file', size: stats.size };
  }

  const structure: Record<string, any> = { type: 'directory', children: {} };
  const files = fs.readdirSync(dir);

  for (const file of files) {
    if (exclude.includes(file)) continue;
    const fullPath = path.join(dir, file);
    structure.children[file] = getDirectoryStructure(fullPath, exclude);
  }

  return structure;
}

function generateKnowledgeGraph() {
  console.info('Generating repository knowledge graph...');
  const docsDir = 'docs/architecture';

  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  try {
    const graph = {
      timestamp: new Date().toISOString(),
      structure: getDirectoryStructure('.'),
    };

    fs.writeFileSync(
      path.join(docsDir, 'knowledge-graph.json'),
      JSON.stringify(graph, null, 2),
      'utf-8',
    );
    console.info(
      'Successfully generated knowledge graph at docs/architecture/knowledge-graph.json',
    );
  } catch (error) {
    console.error('Error generating knowledge graph:', error);
    process.exit(1);
  }
}

generateKnowledgeGraph();
