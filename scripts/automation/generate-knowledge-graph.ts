import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

function generateKnowledgeGraph(): void {
  const dir = 'docs/architecture';
  fs.mkdirSync(dir, { recursive: true });

  console.info('Generating repository knowledge graph using madge...');

  try {
    const outputPath = path.join(dir, 'knowledge-graph.json');
    const dirsToScan = ['src', 'api', 'scripts'].filter((d) => fs.existsSync(d));

    if (dirsToScan.length === 0) {
      console.warn('No source directories found to scan for knowledge graph.');
      return;
    }

    const outputBuffer = execFileSync('npx', [
      '--yes',
      'madge',
      '--extensions',
      'ts,tsx',
      '--json',
      ...dirsToScan,
    ]);
    const outputString = (outputBuffer as unknown as Buffer).toString();

    fs.writeFileSync(outputPath, outputString);
    console.info(`Generated ${outputPath}`);
  } catch (error) {
    console.error('Error generating knowledge graph:', error);
    process.exit(1);
  }
}

generateKnowledgeGraph();
