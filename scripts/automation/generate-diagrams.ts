import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

async function generate() {
  try {
    fs.mkdirSync('docs/architecture', { recursive: true });

    console.info('Generating architecture diagrams using madge...');
    // Execute madge directly via npx
    execFileSync('npx', [
      '--yes',
      'madge',
      '--image',
      'docs/architecture/dependency-graph.svg',
      'src/main.tsx',
      'server.ts',
      'api/analyze.ts',
    ]);

    console.info('Successfully generated architecture diagrams.');
  } catch (e) {
    console.error('Error during diagram generation:', e);
    // Do not exit with 1 if graphviz isn't installed locally for the bot, just log warning
    console.warn('Note: graphviz must be installed to generate images.');
  }
}

void generate();
