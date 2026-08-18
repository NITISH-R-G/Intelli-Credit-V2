import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

function generateDiagrams(): void {
  const outputDir = 'docs/architecture';

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.info(`Created directory: ${outputDir}`);
  }

  try {
    // Generate image using madge (assuming graphviz is installed via CI)
    const outputPath = `${outputDir}/dependency-graph.svg`;
    execFileSync('npx', ['--yes', 'madge', '--image', outputPath, 'src/']);
    console.info(`Diagram generated at ${outputPath}`);
  } catch (error) {
    console.error('Error generating diagrams:', error);
    process.exit(1);
  }
}

generateDiagrams();
