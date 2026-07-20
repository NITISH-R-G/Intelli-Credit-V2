import * as fs from 'fs';
import * as path from 'path';

const archDir = path.join(process.cwd(), 'docs', 'architecture');

fs.mkdirSync(archDir, { recursive: true });

import { execFileSync } from 'child_process';

function generateDiagrams() {
  console.info('Generating architectural diagrams...');

  try {
    const deps = execFileSync('npx', ['--yes', 'madge', '--circular', '--json', 'src'], { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });

    // A simplified map of dependencies
    const parsedDeps = JSON.parse(deps || '{}');
    let mermaid = 'graph TD;\n';

    for (const [module, dependencies] of Object.entries(parsedDeps)) {
      const depsArray = Array.isArray(dependencies) ? dependencies : [];
      depsArray.slice(0, 5).forEach((dep: string) => {
        const modName = module.split('/').pop()?.split('.')[0] || 'Unknown';
        const depName = dep.split('/').pop()?.split('.')[0] || 'Unknown';
        mermaid += `    ${modName}-->${depName};\n`;
      });
    }

    const diagramContent = `
# Service Map

\`\`\`mermaid
${mermaid}
\`\`\`
    `;

    const diagramPath = path.join(archDir, 'SERVICE_MAP.md');
    fs.writeFileSync(diagramPath, diagramContent, 'utf-8');
    console.info(`Diagram generated at ${diagramPath}`);
  } catch (error) {
    console.warn('Could not generate diagram fully, missing madge or error.', error);
    process.exit(0);
  }
}

generateDiagrams();
