import * as fs from 'fs';
import * as path from 'path';

const archDir = path.join(process.cwd(), 'docs', 'architecture');

fs.mkdirSync(archDir, { recursive: true });

import { execFileSync } from 'child_process';

function generateKnowledgeGraph() {
  console.info('Generating repository knowledge graph...');

  try {
    const deps = execFileSync('npx', ['--yes', 'madge', '--json', 'src', 'api'], { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
    const parsedDeps = JSON.parse(deps || '{}');

    let content = '# Knowledge Graph\n\n';

    for (const [module, dependencies] of Object.entries(parsedDeps)) {
      content += `- **${module}**\n`;
      const depsArray = Array.isArray(dependencies) ? dependencies : [];
      if (depsArray.length > 0) {
        depsArray.slice(0, 5).forEach((dep: string) => {
          content += `  - Depends on: \`${dep}\`\n`;
        });
      }
    }

    const graphPath = path.join(archDir, 'KNOWLEDGE_GRAPH.md');
    fs.writeFileSync(graphPath, content, 'utf-8');
    console.info(`Knowledge graph generated at ${graphPath}`);
  } catch (error) {
    console.warn('Could not generate knowledge graph fully.', error);
    process.exit(0);
  }
}

generateKnowledgeGraph();
