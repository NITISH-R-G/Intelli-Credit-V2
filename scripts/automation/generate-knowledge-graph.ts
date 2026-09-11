import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

function generateKnowledgeGraph() {
  try {
    const docsDir = path.join(process.cwd(), 'docs', 'architecture');
    fs.mkdirSync(docsDir, { recursive: true });

    console.info('Generating knowledge graph using madge...');

    // Instead of redirecting output which is tricky with execFileSync without a shell, let's run madge and capture its stdout
    const output = (
      execFileSync('npx', ['--yes', 'madge', '--json', 'src', 'api']) as unknown as Buffer
    ).toString();

    const outputPath = path.join(docsDir, 'knowledge-graph.json');
    fs.writeFileSync(outputPath, output);

    console.info(`Knowledge graph generated at ${outputPath}`);
  } catch (err) {
    console.error('Error generating knowledge graph:', err);
  }
}

void generateKnowledgeGraph();
