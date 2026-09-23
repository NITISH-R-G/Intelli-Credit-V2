import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';

function generateKnowledgeGraph(): void {
  try {
    const outputDir = 'docs/architecture';
    fs.mkdirSync(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, 'knowledge-graph.json');
    console.info(`Generating knowledge graph at ${outputPath}...`);

    // Ensure madge is available. Using npx --yes to avoid prompts.
    const output = (execFileSync('npx', [
      '--yes',
      'madge',
      '--json',
      '--extensions',
      'ts,tsx',
      'src',
      'api'
    ], { encoding: 'utf-8' }) as unknown as string);

    // Filter out the "Processed ... files" output if present before saving
    let jsonContent = output;
    if (output.indexOf('{') > 0) {
      jsonContent = output.substring(output.indexOf('{'));
    }

    fs.writeFileSync(outputPath, jsonContent);

    console.info('Knowledge graph generated successfully.');
  } catch (error) {
    console.error('Error generating knowledge graph:', error);
    process.exit(1);
  }
}

generateKnowledgeGraph();