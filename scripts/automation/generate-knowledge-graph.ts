import { execFileSync } from 'child_process';
import * as fs from 'fs';

function generateKnowledgeGraph(): void {
  console.info('Generating repository knowledge graph...');

  fs.mkdirSync('docs/architecture', { recursive: true });

  try {
    const jsonOutput = execFileSync('npx', ['--yes', 'madge', '--json', 'src/'], {
      encoding: 'utf-8',
    });

    // In a real scenario, this would transform madge output into a rich graph representation
    // For now, we save it as the base knowledge graph.
    fs.writeFileSync('docs/architecture/knowledge-graph.json', jsonOutput as string, 'utf-8');

    console.info('Successfully generated knowledge graph.');
  } catch (error) {
    console.error('Failed to generate knowledge graph.', error);
    process.exit(1);
  }
}

generateKnowledgeGraph();
