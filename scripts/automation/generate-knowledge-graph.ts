import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

function generateKnowledgeGraph(): void {
  try {
    console.info('Generating repository knowledge graph using madge...');
    const outDir = 'docs/architecture';
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const outPath = path.join(outDir, 'knowledge-graph.json');

    // Using npx with --yes
    const output = execFileSync('npx', ['--yes', 'madge', '--json', 'src/', 'api/'], {
      encoding: 'utf-8',
    }) as string;

    fs.writeFileSync(outPath, output, 'utf8');

    console.info(`Knowledge graph successfully generated at ${outPath}`);
  } catch (error) {
    console.error('Error generating knowledge graph:', error);
    process.exit(1);
  }
}

generateKnowledgeGraph();
