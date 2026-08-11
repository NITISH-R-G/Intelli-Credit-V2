import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

function generateDiagrams(): void {
  const dir = 'docs/architecture';
  fs.mkdirSync(dir, { recursive: true });

  console.info('Generating architecture diagrams using madge...');

  try {
    const srcPath = 'src';
    if (fs.existsSync(srcPath)) {
      const outputPath = path.join(dir, 'src-architecture.svg');
      execFileSync('npx', ['--yes', 'madge', '--image', outputPath, srcPath], {
        stdio: 'inherit',
      });
      console.info(`Generated ${outputPath}`);
    }

    const apiPath = 'api';
    if (fs.existsSync(apiPath)) {
      const outputPath = path.join(dir, 'api-architecture.svg');
      execFileSync('npx', ['--yes', 'madge', '--image', outputPath, apiPath], {
        stdio: 'inherit',
      });
      console.info(`Generated ${outputPath}`);
    }
  } catch (error) {
    console.error('Error generating diagrams with madge:', error);
    process.exit(1);
  }
}

generateDiagrams();
