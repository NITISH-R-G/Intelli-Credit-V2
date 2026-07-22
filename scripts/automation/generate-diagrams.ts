import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

function generateDiagrams(): void {
  const docsDir = path.join(process.cwd(), 'docs', 'architecture');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  console.info('Generating repository architecture diagram...');
  try {
    const output = execFileSync(
      'npx',
      [
        '--yes',
        'madge',
        '--image',
        path.join(docsDir, 'architecture-diagram.svg'),
        '--exclude',
        'node_modules|dist|tests',
        'src',
      ],
      { encoding: 'utf-8', stdio: 'pipe' }
    ) as string;
    console.info('Successfully generated architecture diagram.', output);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Failed to generate architecture diagram:', error.message);
    } else {
      console.error('Failed to generate architecture diagram:', String(error));
    }
    process.exit(1);
  }
}

generateDiagrams();
