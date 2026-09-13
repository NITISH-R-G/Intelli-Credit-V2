import * as fs from 'node:fs';
import { execFileSync } from 'node:child_process';

function generateKnowledgeGraph() {
  console.info('Generating repository knowledge graph...');
  const outDir = 'docs/architecture';
  fs.mkdirSync(outDir, { recursive: true });

  try {
    const output = execFileSync('npx', ['--yes', 'madge', '--json', 'src/', 'api/', 'server.ts'], {
      encoding: 'utf-8',
    }) as string;
    fs.writeFileSync(`${outDir}/knowledge-graph.json`, output);
    console.info('Knowledge graph generated successfully.');
  } catch (error) {
    console.error('Error generating knowledge graph:', error);
  }
}

generateKnowledgeGraph();
