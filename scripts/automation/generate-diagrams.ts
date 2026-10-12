import madge from 'madge';
import * as fs from 'node:fs';

async function generateDiagrams() {
  process.stdout.write('Generating dependency graph...\n');
  const outputDir = 'docs/architecture';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const entryPoints = ['src', 'api', 'server.ts'];

  try {
    const res = await madge(entryPoints, {
      fileExtensions: ['ts', 'tsx', 'js', 'jsx'],
      excludeRegExp: [/node_modules/, /\.test\./, /\.spec\./],
    });

    await res.image(`${outputDir}/dependency-graph.svg`);
    process.stdout.write(`Dependency graph generated at ${outputDir}/dependency-graph.svg\n`);
  } catch (error) {
    process.stderr.write(`Error generating dependency graph: ${error}\n`);
    process.exit(1);
  }
}

await generateDiagrams().catch(() => process.exit(1));
