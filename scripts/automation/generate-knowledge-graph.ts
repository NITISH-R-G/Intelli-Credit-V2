import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

function generateKnowledgeGraph(): void {
  const docsDir = path.join(process.cwd(), 'docs', 'architecture');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  console.info('Generating repository knowledge graph...');
  try {
    const output = execFileSync(
      'npx',
      [
        '--yes',
        'madge',
        '--json',
        '--exclude',
        'node_modules|dist|tests',
        'src',
      ],
      { encoding: 'utf-8', stdio: 'pipe' }
    ) as string;

    const graphData = JSON.parse(output) as Record<string, string[]>;
    let markdown = '# Repository Knowledge Graph\n\n';
    markdown += 'This graph represents the dependencies and relationships within the repository.\n\n';

    for (const [moduleName, dependencies] of Object.entries(graphData)) {
      markdown += `## ${moduleName}\n`;
      if (dependencies.length > 0) {
        markdown += 'Dependencies:\n';
        for (const dep of dependencies) {
          markdown += `- \`${dep}\`\n`;
        }
      } else {
        markdown += '*No internal dependencies.*\n';
      }
      markdown += '\n';
    }

    fs.writeFileSync(path.join(docsDir, 'knowledge-graph.md'), markdown, 'utf-8');
    console.info('Successfully generated knowledge graph at docs/architecture/knowledge-graph.md.');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Failed to generate knowledge graph:', error.message);
    } else {
      console.error('Failed to generate knowledge graph:', String(error));
    }
    process.exit(1);
  }
}

generateKnowledgeGraph();
