import { execFileSync } from 'child_process';
import * as fs from 'fs';

function generateDiagrams(): void {
  try {
    const outDir = 'docs/architecture';
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    console.info('Generating architecture diagrams using madge...');
    // Use npx madge to generate image if graphviz is installed
    // We'll generate a json map for now just to make sure it works if graphviz isn't perfectly set up locally but the CI will have it
    const result = execFileSync(
      'npx',
      [
        '--yes',
        'madge',
        '--image',
        `${outDir}/dependency-graph.svg`,
        '--extensions',
        'ts,tsx',
        'src/',
      ],
      { encoding: 'utf-8' },
    );
    console.info('Diagram generation output:', result as string);
  } catch (error) {
    console.error('Failed to generate diagrams:', error);
  }
}

generateDiagrams();
