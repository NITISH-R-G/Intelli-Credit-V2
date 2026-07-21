import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';

const docsDir = 'docs/architecture';
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

function generateKnowledgeGraph() {
  try {
    console.info('Generating repository knowledge graph...');

    const allFilesOutput = execFileSync('git', ['ls-files'], { encoding: 'utf-8' }) as string;
    const files = allFilesOutput.split('\n').filter(Boolean);

    const graph = {
      nodes: files.map((file) => ({ id: file, group: path.extname(file) || 'folder' })),
      links: [], // Advanced link generation logic could be added here
    };

    const graphPath = path.join(docsDir, 'knowledge-graph.json');
    fs.writeFileSync(graphPath, JSON.stringify(graph, null, 2));

    console.info(`Knowledge graph successfully written to ${graphPath}`);
  } catch (error) {
    console.error('Failed to generate knowledge graph:', error);
    process.exit(1);
  }
}

generateKnowledgeGraph();
