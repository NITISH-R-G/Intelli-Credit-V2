import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';

function generateKnowledgeGraph(): void {
  const outputDir = path.join('docs', 'architecture');
  fs.mkdirSync(outputDir, { recursive: true });

  const dirsToAnalyze = ['src', 'api'];
  const existingDirs = dirsToAnalyze.filter((dir) => fs.existsSync(dir));

  if (existingDirs.length === 0) {
    console.info('No source directories found to analyze.');
    return;
  }

  const jsonOutputPath = path.join(outputDir, 'knowledge-graph.json');
  const imageOutputPath = path.join(outputDir, 'dependency-graph.svg');

  try {
    // Generate JSON knowledge graph
    console.info('Generating knowledge-graph.json...');
    const jsonArgs = ['--yes', 'madge', '--json', ...existingDirs];
    const jsonOutput = execFileSync('npx', jsonArgs, { encoding: 'utf-8' }) as string;
    fs.writeFileSync(jsonOutputPath, jsonOutput, { encoding: 'utf-8' });
    console.info(`Successfully generated ${jsonOutputPath}`);

    // Generate SVG dependency graph
    console.info('Generating dependency-graph.svg...');
    const imageArgs = ['--yes', 'madge', '--image', imageOutputPath, ...existingDirs];
    execFileSync('npx', imageArgs, { encoding: 'utf-8' });
    console.info(`Successfully generated ${imageOutputPath}`);
  } catch (error) {
    console.error('Failed to generate knowledge graph or diagram:', error);
    process.exit(1);
  }
}

generateKnowledgeGraph();
