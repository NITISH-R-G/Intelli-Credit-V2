import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';

function generateKnowledgeGraph(): void {
  const outDir = path.join('docs', 'architecture');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, 'knowledge-graph.json');
  console.info(`Generating knowledge graph to ${outPath}`);

  try {
    // Generate raw JSON to standard output, write it to file
    const output = execFileSync('npx', ['--yes', 'madge', '--json', 'src/', 'api/'], {
      encoding: 'utf-8',
    }) as string;
    fs.writeFileSync(outPath, output, 'utf8');
    console.info('Successfully generated knowledge graph.');
  } catch (error) {
    console.error('Failed to generate knowledge graph:', error);
    process.exitCode = 1;
  }
}

generateKnowledgeGraph();
