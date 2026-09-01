import * as fs from 'node:fs';
import { execFileSync } from 'node:child_process';

function analyzeRepo(): void {
  try {
    console.info('Ensuring architecture docs directory exists...');
    fs.mkdirSync('docs/architecture', { recursive: true });

    console.info('Generating architecture diagrams...');
    const diagramsOutput = (
      execFileSync('npx', [
        '--yes',
        'madge',
        'src/',
        '--image',
        'docs/architecture/dependency-graph.svg',
      ]) as unknown as Buffer
    ).toString();
    console.info(diagramsOutput);

    console.info('Generating knowledge graph...');
    const knowledgeGraphOutput = (
      execFileSync('npx', ['--yes', 'madge', 'src/', '--json']) as unknown as Buffer
    ).toString();
    fs.writeFileSync('docs/architecture/knowledge-graph.json', knowledgeGraphOutput);
    console.info('Knowledge graph written to docs/architecture/knowledge-graph.json');
  } catch (err) {
    console.error('Error during repository analysis:', err);
    process.exit(1);
  }
}

analyzeRepo();
