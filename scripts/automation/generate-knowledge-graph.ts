import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';

function generateKnowledgeGraph(): void {
  const outputDir = 'docs/architecture';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'knowledge-graph.json');

  try {
    console.info('Generating knowledge graph...');
    const output = execFileSync('npx', ['--yes', 'madge', '--json', 'src/', 'api/'], {
      encoding: 'utf-8',
    }) as string;
    fs.writeFileSync(outputPath, output);
    console.info(`Successfully generated knowledge graph at ${outputPath}`);
  } catch (error) {
    console.error('Failed to generate knowledge graph.', error);
    process.exit(1);
  }
}

generateKnowledgeGraph();
