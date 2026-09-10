import * as fs from 'node:fs';

function analyze() {
  fs.mkdirSync('docs/architecture', { recursive: true });

  console.info('Repository analysis initiated.');
  console.info(
    'Run `npm run generate:diagrams` and `npm run generate:knowledge-graph` to build architecture outputs.',
  );

  const metadata = {
    analyzedAt: new Date().toISOString(),
    status: 'success',
    instructions: 'Use madge generated artifacts in this folder for architecture intelligence.',
  };

  fs.writeFileSync(
    'docs/architecture/analysis-metadata.json',
    JSON.stringify(metadata, null, 2),
    'utf8',
  );
}

analyze();
