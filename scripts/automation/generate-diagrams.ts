import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';

// Architecture Diagram Generation

const generateDiagrams = (): void => {
  try {
    fs.mkdirSync('docs/architecture', { recursive: true });

    console.info('Generating repository architecture diagrams using madge...');

    // Run madge to generate diagrams
    // Uses execFileSync with explicit string cast as per memory instructions

    // Generate SVG diagram
    const svgOutput = (
      execFileSync('npx', [
        '--yes',
        'madge',
        '--image',
        'docs/architecture/ARCHITECTURE_DIAGRAM.svg',
        '--extensions',
        'ts,tsx',
        'src',
        'api',
      ]) as unknown as Buffer
    ).toString('utf-8');
    console.info(svgOutput);

    // Generate JSON structure for other uses
    const jsonOutput = (
      execFileSync('npx', [
        '--yes',
        'madge',
        '--json',
        '--extensions',
        'ts,tsx',
        'src',
        'api',
      ]) as unknown as Buffer
    ).toString('utf-8');
    fs.writeFileSync('docs/architecture/DEPENDENCIES.json', jsonOutput);

    console.info('Successfully generated architecture diagrams and dependency JSON.');
  } catch (error) {
    console.error('Error during diagram generation:', error);
    process.exit(1);
  }
};

generateDiagrams();
