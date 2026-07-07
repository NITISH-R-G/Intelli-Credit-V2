import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

function run() {
  console.info('Generating Knowledge Graph...');

  const docsDir = join(process.cwd(), 'docs');
  if (!existsSync(docsDir)) {
    mkdirSync(docsDir, { recursive: true });
  }

  try {
    const srcDir = join(process.cwd(), 'src');
    const nodes: any[] = [];
    const edges: any[] = [];

    if (existsSync(srcDir)) {
      const files = readdirSync(srcDir, { recursive: true });
      files.forEach((file: any) => {
        if (typeof file === 'string' && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
          nodes.push({ id: file, label: file, type: 'file' });
        }
      });
    }

    writeFileSync(join(docsDir, 'knowledge-graph.json'), JSON.stringify({ nodes, edges }, null, 2));
    console.info('Knowledge graph complete, written to docs/knowledge-graph.json.');
  } catch (error) {
    console.error('Error generating knowledge graph:', error);
  }
}

run();
