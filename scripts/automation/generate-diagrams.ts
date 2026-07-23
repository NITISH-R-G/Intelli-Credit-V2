import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

function generateDiagrams() {
  console.info('Starting architecture diagram generation...');
  const outDir = path.join(process.cwd(), 'docs', 'architecture');
  fs.mkdirSync(outDir, { recursive: true });

  const srcPath = path.join(process.cwd(), 'src');
  const outSvg = path.join(outDir, 'architecture.svg');

  try {
    const output = execFileSync('npx', ['--yes', 'madge', '--image', outSvg, srcPath], { encoding: 'utf-8' }) as string;
    console.info(output);
    console.info(`Diagram successfully generated at ${outSvg}`);
  } catch (err) {
    console.error('Failed to generate diagrams. Is graphviz installed?', err);
    process.exit(1);
  }
}

generateDiagrams();
