import * as fs from 'node:fs';
import { execFileSync } from 'node:child_process';

function generateKnowledgeGraph(): void {
  try {
    fs.mkdirSync('docs/architecture', { recursive: true });

    // Generate JSON knowledge graph using madge
    const output = execFileSync('npx', ['--yes', 'madge', '--json', 'src/App.tsx'], { encoding: 'utf-8' }) as string;
    fs.writeFileSync('docs/architecture/knowledge-graph.json', output);
    console.info('Successfully generated knowledge graph.');
  } catch (error) {
    console.error('Error generating knowledge graph:', error);
    process.exit(1);
  }
}

generateKnowledgeGraph();
