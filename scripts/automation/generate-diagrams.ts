import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';

function main() {
  const outputDir = path.join('docs', 'architecture');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'dependency-graph.svg');
  console.info(`Generating architecture diagram to ${outputPath}...`);

  try {
    execFileSync('npx', ['--yes', 'madge', '--image', outputPath, 'src/']);
    console.info('Successfully generated architecture diagram.');
  } catch (error) {
    console.error('Error generating architecture diagram:', error);
    process.exit(1);
  }
}

main();
