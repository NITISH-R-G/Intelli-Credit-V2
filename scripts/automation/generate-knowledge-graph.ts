import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

function generateKnowledgeGraph(): void {
  try {

    console.info('Generating repository knowledge graph using madge...');
    const outDir = 'docs/architecture';
    fs.mkdirSync(outDir, { recursive: true });

    const outPath = path.join(outDir, 'knowledge-graph.json');

    // Output madge JSON format to capture dependencies
    const output = (execFileSync('npx', ['--yes', 'madge', '--json', 'src/', 'api/', 'server.ts', 'scripts/']) as unknown as Buffer).toString('utf-8');

    fs.writeFileSync(outPath, output);


    console.info(`Successfully generated knowledge graph to ${outPath}`);
  } catch (error) {

    console.error('Error generating knowledge graph:', error);
    process.exit(1);
  }
}

generateKnowledgeGraph();
