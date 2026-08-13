import { execFileSync } from 'child_process';
import * as fs from 'fs';

function generateDiagrams(): void {
  const outDir = 'docs/architecture';
  fs.mkdirSync(outDir, { recursive: true });

  console.info('Generating dependency graph...');
  try {
    const output = (execFileSync('npx', ['--yes', 'madge', 'src/', 'api/', '--image', `${outDir}/dependency-graph.svg`], { encoding: 'utf-8' }) as unknown as string);
    console.info(output);
    console.info(`Diagram generated successfully at ${outDir}/dependency-graph.svg`);
  } catch (error) {
    console.error('Failed to generate diagram via madge.', error);
    process.exit(1);
  }
}

generateDiagrams();
