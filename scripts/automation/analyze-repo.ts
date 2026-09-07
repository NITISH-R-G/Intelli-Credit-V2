import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

function analyze(): void {
  try {
    const outputDir = path.join('docs', 'architecture');
    fs.mkdirSync(outputDir, { recursive: true });

    console.info('Generating architecture diagrams...');
    const diagramOutput = (
      execFileSync('npm', ['run', 'generate:diagrams']) as unknown as Buffer
    ).toString('utf-8');
    console.info(diagramOutput);

    console.info('Generating knowledge graph...');
    const graphOutput = (
      execFileSync('npm', ['run', 'generate:knowledge-graph']) as unknown as Buffer
    ).toString('utf-8');
    console.info(graphOutput);

    console.info('Repository analysis complete.');
  } catch (error) {
    console.error('Error during repository analysis:', error);
    process.exit(1);
  }
}

analyze();
