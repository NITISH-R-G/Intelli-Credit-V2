import * as fs from 'node:fs';
import * as path from 'node:path';
import madge from 'madge';

async function generateDiagrams() {
  const outputDir = path.join(process.cwd(), 'docs', 'architecture');
  fs.mkdirSync(outputDir, { recursive: true });

  try {
    const res = await madge('./src');

    await res.image(path.join(outputDir, 'dependency-graph.svg'));
    console.info('dependency-graph.svg generated successfully.');
  } catch (error) {
    console.error('Error generating diagrams:', error);
    process.exit(1);
  }
}

void generateDiagrams();
