import { execFileSync } from 'child_process';
import * as fs from 'fs';

function generateKnowledgeGraph(): void {
  try {
    const outDir = 'docs/architecture';
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    console.info('Generating repository knowledge graph...');
    const result = execFileSync('npx', ['--yes', 'madge', '--json', 'src/'], {
      encoding: 'utf-8',
    });

    fs.writeFileSync(`${outDir}/knowledge-graph.json`, result as string, 'utf-8');
    console.info('Knowledge graph generated at docs/architecture/knowledge-graph.json');
  } catch (error) {
    console.error('Failed to generate knowledge graph:', error);
  }
}

generateKnowledgeGraph();
