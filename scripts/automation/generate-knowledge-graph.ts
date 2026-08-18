import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

function generateKnowledgeGraph(): void {
  const outputDir = 'docs/architecture';

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.info(`Created directory: ${outputDir}`);
  }

  try {
    const outputPath = `${outputDir}/knowledge-graph.json`;
    // Run madge in JSON format to generate a knowledge graph structure
    const madgeOutput = (execFileSync('npx', ['--yes', 'madge', '--json', 'src/']) as unknown as Buffer).toString();
    fs.writeFileSync(outputPath, madgeOutput);
    console.info(`Knowledge graph generated at ${outputPath}`);
  } catch (error) {
    console.error('Error generating knowledge graph:', error);
    process.exit(1);
  }
}

generateKnowledgeGraph();
