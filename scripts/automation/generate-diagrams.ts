import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

function generateDiagrams(): void {
  try {
    console.info('Generating architecture diagrams using madge...');
    const outDir = 'docs/architecture';
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const outPath = path.join(outDir, 'diagram.svg');

    // Using npx with --yes to avoid interactive prompts
    execFileSync('npx', ['--yes', 'madge', '--image', outPath, 'src/', 'api/'], {
      encoding: 'utf-8',
      stdio: 'inherit',
    });

    console.info(`Diagram successfully generated at ${outPath}`);
  } catch (error) {
    console.error('Error generating diagrams:', error);
    process.exit(1);
  }
}

generateDiagrams();
