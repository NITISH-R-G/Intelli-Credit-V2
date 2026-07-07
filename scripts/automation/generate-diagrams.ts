import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

function run() {
  console.info('Generating Architecture Diagrams...');

  const docsDir = join(process.cwd(), 'docs');
  if (!existsSync(docsDir)) {
    mkdirSync(docsDir, { recursive: true });
  }

  try {
    const dependencies = execFileSync('npm', ['ls', '--depth=0', '--json'], { encoding: 'utf-8' });
    let mermaid = '```mermaid\ngraph TD;\n';
    try {
      const parsed = JSON.parse(dependencies);
      if (parsed.dependencies) {
        for (const dep of Object.keys(parsed.dependencies)) {
          mermaid += `    App-->${dep.replace(/[^a-zA-Z0-9]/g, '_')};\n`;
        }
      }
    } catch {
      // Ignore parsing errors for mock logic
    }
    mermaid += '```';

    writeFileSync(join(docsDir, 'architecture.md'), `# Architecture Dependencies\n\n${mermaid}`);
    console.info('Diagrams complete, written to docs/architecture.md.');
  } catch (error) {
    console.error('Error generating diagrams:', error);
  }
}

run();
