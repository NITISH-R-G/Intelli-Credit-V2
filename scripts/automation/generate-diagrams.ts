import { execFileSync } from 'child_process';
import * as fs from 'fs';

function generateDiagrams() {
  const outputDir = 'docs/architecture';
  fs.mkdirSync(outputDir, { recursive: true });

  const outputFile = `${outputDir}/architecture-diagram.svg`;

  try {
    console.info(`Generating architecture diagram to ${outputFile}...`);
    // Using execFileSync to avoid shell injection and strictly calling madge
    execFileSync('npx', ['--yes', 'madge', '--image', outputFile, 'src/', 'api/']);
    console.info('Architecture diagram generated successfully.');
  } catch (error) {
    console.error('Error generating architecture diagram. Ensure graphviz is installed.', error);
    process.exit(1);
  }
}

generateDiagrams();
