import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

function analyzeRepo(): void {
  const outputDir = path.join(process.cwd(), 'docs', 'architecture');
  fs.mkdirSync(outputDir, { recursive: true });

  const entryPoint = 'src/main.tsx'; // Assuming this is the entry point, or just use 'src'
  const targetToAnalyze = fs.existsSync(entryPoint) ? entryPoint : 'src';

  try {
    // Generate dependency graph SVG
    console.info('Generating dependency graph...');
    execFileSync('npx', [
      '--yes',
      'madge',
      targetToAnalyze,
      '--image',
      path.join(outputDir, 'dependency-graph.svg'),
    ]);
    console.info('Dependency graph generated successfully.');

    // Generate knowledge graph JSON
    console.info('Generating knowledge graph JSON...');
    const knowledgeGraphJson = (execFileSync('npx', [
      '--yes',
      'madge',
      targetToAnalyze,
      '--json',
    ]) as unknown as Buffer).toString('utf-8');

    fs.writeFileSync(path.join(outputDir, 'knowledge-graph.json'), knowledgeGraphJson);
    console.info('Knowledge graph JSON generated successfully.');

  } catch (error) {
    console.error('Error generating architecture intelligence:', error);
    process.exit(1);
  }
}

analyzeRepo();
