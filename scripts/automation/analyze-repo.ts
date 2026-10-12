import * as fs from 'node:fs';
import * as path from 'node:path';
import { getFiles } from './utils.js';

function generateKnowledgeGraph() {
  process.stdout.write('Generating Knowledge Graph...\n');
  const allFiles = getFiles('.');

  const graph: Record<string, unknown> = {
    repository: 'Intelli-Credit',
    timestamp: new Date().toISOString(),
    files: allFiles.length,
    structure: {}
  };

  for (const file of allFiles) {
    const ext = path.extname(file);
    if (!graph.structure[ext as keyof typeof graph.structure]) {
       (graph.structure as Record<string, string[]>)[ext] = [];
    }
    (graph.structure as Record<string, string[]>)[ext].push(file);
  }

  const outputDir = 'docs/architecture';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(`${outputDir}/knowledge-graph.json`, JSON.stringify(graph, null, 2));
  process.stdout.write(`Knowledge graph generated at ${outputDir}/knowledge-graph.json\n`);
}

generateKnowledgeGraph();
