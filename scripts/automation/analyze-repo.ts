import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';

function analyzeRepo() {
  const outDir = 'docs/architecture';
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  try {
    // Generate JSON knowledge graph (madge requires --yes implicitly handled by npx --yes in package.json, but we ensure it here)
    console.info('Generating knowledge graph...');
    const jsonOutput = (execFileSync('npx', ['--yes', 'madge', 'src/main.tsx', '--json']) as unknown as Buffer).toString('utf-8');
    fs.writeFileSync(`${outDir}/knowledge-graph.json`, jsonOutput);
    console.info('Knowledge graph saved to docs/architecture/knowledge-graph.json');

    // Generate SVG diagram
    console.info('Generating architecture diagram...');
    execFileSync('npx', ['--yes', 'madge', 'src/main.tsx', '--image', `${outDir}/dependency-graph.svg`]);
    console.info('Architecture diagram saved to docs/architecture/dependency-graph.svg');

  } catch (err) {
    console.error('Failed to generate architecture intelligence.', err);
    process.exit(1);
  }
}

analyzeRepo();
