import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

function generateDiagrams(): void {
  try {
    console.info('Generating architecture diagrams using madge...');
    const outDir = 'docs/architecture';
    fs.mkdirSync(outDir, { recursive: true });

    // Check if graphviz is installed before trying to generate an image
    try {
      execFileSync('dot', ['-V']);
    } catch {
      console.warn('Graphviz (dot) is not installed. Skipping SVG diagram generation. Please install graphviz.');
      return;
    }

    const outPath = path.join(outDir, 'dependency-graph.svg');

    // Generate SVG dependency graph of src directory
    execFileSync('npx', ['--yes', 'madge', '--image', outPath, 'src/', 'api/', 'server.ts'], { stdio: 'inherit' });

    console.info(`Successfully generated dependency graph to ${outPath}`);
  } catch (error) {
    console.error('Error generating diagrams:', error);
    process.exit(1);
  }
}

generateDiagrams();
