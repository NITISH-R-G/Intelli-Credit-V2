import * as fs from 'node:fs';
import { execFileSync } from 'node:child_process';

function generateDiagrams() {
  console.info('Generating architecture diagrams...');
  try {
    fs.mkdirSync('docs/architecture', { recursive: true });

    // Generate JSON structure for knowledge graph
    const madgeJson = execFileSync('npx', ['--yes', 'madge', '--json', 'src'], {
      encoding: 'utf-8',
    });
    fs.writeFileSync('docs/architecture/knowledge-graph.json', madgeJson);

    // Attempt SVG generation if graphviz is installed (often handled in CI)
    try {
      execFileSync(
        'npx',
        ['--yes', 'madge', '--image', 'docs/architecture/dependency-graph.svg', 'src'],
        { stdio: 'inherit' },
      );
      console.info('Diagrams generated successfully.');
    } catch (e) {
      console.warn('Could not generate SVG diagram. Ensure Graphviz is installed.', e);
    }
  } catch (error) {
    console.error('Error generating diagrams:', error);
  }
}

generateDiagrams();
