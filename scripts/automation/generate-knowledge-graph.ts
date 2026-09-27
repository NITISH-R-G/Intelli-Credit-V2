import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';

function generateKnowledgeGraph(): void {
  try {
    const targetDirs = ['src', 'api', 'server.ts'].filter((dir) => fs.existsSync(dir));
    if (targetDirs.length === 0) {
      console.info('No relevant directories found for knowledge graph generation.');
      return;
    }

    console.info('Generating repository knowledge graph...');
    fs.mkdirSync('docs/architecture', { recursive: true });

    // Ensure we use npx --yes to prevent prompts, and explicitly cast output to string
    const output = execFileSync('npx', ['--yes', 'madge', '--json', ...targetDirs], {
      encoding: 'utf-8',
    }) as string;

    fs.writeFileSync('docs/architecture/knowledge-graph.json', output, 'utf-8');
    console.info('Knowledge graph saved to docs/architecture/knowledge-graph.json');
  } catch {
    console.error('Failed to generate knowledge graph');
    process.exit(1);
  }
}

generateKnowledgeGraph();
