import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const targetDir = 'docs/architecture';
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

try {
  // Generate JSON representation for knowledge graph
  const output = execFileSync('npx', ['--yes', 'madge', '--json', 'src/'], {
    encoding: 'utf-8',
  }) as string;
  fs.writeFileSync(`${targetDir}/knowledge-graph.json`, output);
  console.info('Knowledge graph generated successfully.');
} catch (error) {
  console.error('Error generating knowledge graph:', error);
}
