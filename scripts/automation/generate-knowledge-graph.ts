import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

function generateKnowledgeGraph() {
  console.info('Generating knowledge graph...');

  const docsPath = path.join('docs', 'architecture');
  if (!fs.existsSync(docsPath)) {
    fs.mkdirSync(docsPath, { recursive: true });
  }

  try {
    const files = execFileSync('git', ['ls-files'], { encoding: 'utf-8' })
      .split('\n')
      .filter(f => f.trim() !== '')
      .map(f => `- ${f}`)
      .join('\n');

    const graphContent = `
# Repository Knowledge Graph

## Files Map
${files}
`;

    fs.writeFileSync(path.join(docsPath, 'KNOWLEDGE_GRAPH.md'), graphContent);
    console.info('Knowledge graph generated.');
  } catch (error) {
    console.error('Failed to generate knowledge graph', error);
  }
}

generateKnowledgeGraph();
