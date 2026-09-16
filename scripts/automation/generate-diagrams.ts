import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';

function generateDiagrams() {
  try {
    const outputDir = path.join('docs', 'architecture');
    fs.mkdirSync(outputDir, { recursive: true });

    console.info('Generating dependency graph (SVG)...');

    // We use npx --yes madge --image to generate the SVG
    // This requires Graphviz to be installed on the system
    execFileSync('npx', [
      '--yes',
      'madge',
      '--image',
      path.join(outputDir, 'dependency-graph.svg'),
      'src/',
    ]);

    console.info('Successfully generated architecture diagrams.');
  } catch (error) {
    console.error('Error generating architecture diagrams:', error);
    process.exit(1);
  }
}

generateDiagrams();
