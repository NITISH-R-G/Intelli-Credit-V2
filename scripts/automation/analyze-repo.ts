import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';
import madge from 'madge';

async function generateArchitecture() {
  const outputDir = path.join(process.cwd(), 'docs', 'architecture');
  fs.mkdirSync(outputDir, { recursive: true });

  try {
    const res = await madge('./src');

    const jsonOutput = res.obj();
    fs.writeFileSync(
      path.join(outputDir, 'knowledge-graph.json'),
      JSON.stringify(jsonOutput, null, 2),
    );
    console.info('knowledge-graph.json generated successfully.');
  } catch (error) {
    console.error('Error generating architecture data:', error);
    process.exit(1);
  }
}

void generateArchitecture();
