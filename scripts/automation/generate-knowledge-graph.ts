import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';

function generateKnowledgeGraph() {
  try {
    const outputDir = path.join('docs', 'architecture');
    fs.mkdirSync(outputDir, { recursive: true });

    console.info('Generating JSON knowledge graph...');

    // We use npx --yes madge --json to generate the JSON graph
    const output = execFileSync('npx', ['--yes', 'madge', '--json', 'src/'], {
      encoding: 'utf-8',
    }) as string;

    fs.writeFileSync(path.join(outputDir, 'knowledge-graph.json'), output);
    console.info('Successfully generated JSON knowledge graph.');
  } catch (error) {
    console.error('Error generating JSON knowledge graph:', error);
    process.exit(1);
  }
}

generateKnowledgeGraph();
