import * as fs from 'node:fs';
import { execFileSync } from 'node:child_process';

function main(): void {
  console.info('Generating repository knowledge graph...');
  try {
    fs.mkdirSync('docs/architecture', { recursive: true });

    // Run madge and capture the JSON output using execFileSync
    const madgeOutput = execFileSync(
      'npx',
      ['--yes', 'madge', '--json', 'src', 'api', 'server.ts'],
      { encoding: 'utf-8' },
    ) as string;

    fs.writeFileSync('docs/architecture/knowledge-graph.json', madgeOutput, 'utf8');
    console.info('Successfully generated knowledge-graph.json');
  } catch (error) {
    console.error('Failed to generate knowledge graph:', error);
    process.exit(1);
  }
}

main();
