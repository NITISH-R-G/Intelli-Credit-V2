import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

function generateKnowledgeGraph() {
  fs.mkdirSync('docs/architecture', { recursive: true });

  let dependencies = '';
  try {
    dependencies = execFileSync('npm', ['ls', '--depth=0', '--json'], { encoding: 'utf-8' }) as string;
  } catch (error) {
    console.error('Failed to list npm dependencies', error);
  }

  const graphContent = `# Knowledge Graph

Auto-generated knowledge graph mapping repository dependencies and structures.

## Dependencies

\`\`\`json
${dependencies}
\`\`\`
`;

  fs.writeFileSync('docs/architecture/knowledge-graph.md', graphContent);
  console.info('Knowledge graph generated successfully.');
}

generateKnowledgeGraph();
