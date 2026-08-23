import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function generateKnowledgeGraph(): void {
  console.info('Generating repository knowledge graph using madge...');
  const outDir = path.resolve(process.cwd(), 'docs/architecture');
  fs.mkdirSync(outDir, { recursive: true });
  const outputFile = path.join(outDir, 'knowledge-graph.json');

  try {
    const result = (execFileSync('npx', ['--yes', 'madge', '--json', 'src/', 'api/', 'scripts/']) as unknown as Buffer).toString();
    fs.writeFileSync(outputFile, result);
    console.info(`Knowledge graph generated successfully at ${outputFile}`);
  } catch (error) {
    console.error('Error generating knowledge graph:', error);
    process.exit(1);
  }
}

generateKnowledgeGraph();
