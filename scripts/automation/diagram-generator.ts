import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const targetDir = 'docs/architecture';
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

try {
  // Using execFileSync with separated executable and argument arrays
  const output = execFileSync('npx', ['--yes', 'madge', '--image', `${targetDir}/architecture.svg`, 'src/'], {
    encoding: 'utf-8',
  }) as string;
  console.info('Diagram generated successfully:', output);
} catch (error) {
  console.error('Error generating diagram:', error);
  // Do not fail the build if graphviz is missing locally; CI will have it.
}
