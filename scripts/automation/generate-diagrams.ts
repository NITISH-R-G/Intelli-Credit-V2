import { execFileSync } from 'child_process';
import * as fs from 'fs';

function generateDiagrams() {
  try {
    const dir = 'docs/architecture';
    fs.mkdirSync(dir, { recursive: true });

    console.info('Generating architecture diagrams using madge...');
    const result = execFileSync(
      'npx',
      ['--yes', 'madge', '--image', 'docs/architecture/architecture.png', 'src/', 'api/'],
      { encoding: 'utf-8' },
    ) as string;
    console.info('Madge output:', result);
    console.info('Architecture diagrams generated successfully.');
  } catch (error) {
    console.error('Error generating diagrams:', error);
  }
}

generateDiagrams();
