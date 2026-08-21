import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

function generateDiagrams() {
  console.info('Starting architecture diagram generation...');
  const docsDir = 'docs/architecture';

  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
    console.info(`Created directory: ${docsDir}`);
  }

  try {
    // Run madge to generate an SVG diagram
    const output = execFileSync('npx', [
      '--yes',
      'madge',
      '--image',
      path.join(docsDir, 'architecture.svg'),
      'src/',
    ]);
    const resultStr = (output as unknown as Buffer).toString();
    console.info('Madge output:', resultStr);
    console.info(
      `Successfully generated architecture diagram at ${path.join(docsDir, 'architecture.svg')}`,
    );
  } catch (error) {
    console.error('Error generating architecture diagram with madge:', error);
    console.info('Make sure graphviz is installed (e.g., sudo apt-get install -y graphviz)');
    process.exit(1);
  }
}

generateDiagrams();
