import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';

function main() {
  try {
    // Check if tree is installed
    try {
      execFileSync('tree', ['--version']);
    } catch {
      throw new Error('Tree command not found');
    }

    // Simplistic text representation
    const treeText = execFileSync('tree', ['-L', '3', 'src', 'api', 'docs'], { encoding: 'utf-8' });

    const content = `# Repository Knowledge Graph

## Structure
\`\`\`text
${treeText}
\`\`\`

*Generated automatically.*
`;

    if (!existsSync('docs/knowledge-graph')) {
      mkdirSync('docs/knowledge-graph', { recursive: true });
    }

    writeFileSync('docs/knowledge-graph/repo-graph.md', content);
    console.info('Knowledge graph generated at docs/knowledge-graph/repo-graph.md');
  } catch {
    console.warn('Tree command might not be installed, falling back to find.');
    const findOutput = execFileSync(
      'find',
      ['.', '-maxdepth', '3', '-not', '-path', '*/node_modules/*'],
      { encoding: 'utf-8' },
    );

    const content = `# Repository Knowledge Graph

## Files and Directories
\`\`\`text
${findOutput}
\`\`\`

*Generated automatically.*
`;
    if (!existsSync('docs/knowledge-graph')) {
      mkdirSync('docs/knowledge-graph', { recursive: true });
    }
    writeFileSync('docs/knowledge-graph/repo-graph.md', content);
    console.info('Knowledge graph generated at docs/knowledge-graph/repo-graph.md');
  }
}

main();
