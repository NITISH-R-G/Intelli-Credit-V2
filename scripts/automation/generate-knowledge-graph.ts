import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';

function main() {
  const outputDir = path.join('docs', 'architecture');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'knowledge-graph.json');
  console.info(`Generating knowledge graph to ${outputPath}...`);

  try {
    const result = execFileSync('npx', ['--yes', 'madge', '--json', 'src/']) as unknown as Buffer;
    fs.writeFileSync(outputPath, result.toString('utf-8'));
    console.info('Successfully generated knowledge graph.');
  } catch (error) {
    console.error('Error generating knowledge graph:', error);
    process.exit(1);
  }
}

main();
