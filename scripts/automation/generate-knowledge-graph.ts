import * as fs from 'node:fs';
import * as path from 'node:path';
import madge from 'madge';

async function generateKnowledgeGraph() {
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
    console.error('Error generating knowledge graph:', error);
    process.exit(1);
  }
}

void generateKnowledgeGraph();
