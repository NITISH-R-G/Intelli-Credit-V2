import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';

function analyzeRepo(): void {
  fs.mkdirSync('docs/architecture', { recursive: true });

  try {
    const output = (
      execFileSync('npx', ['--yes', 'madge', '--circular', 'src/']) as unknown as Buffer
    ).toString();
    fs.writeFileSync('docs/architecture/circular-dependencies.txt', output);
    console.info('Successfully generated circular dependency analysis.');
  } catch (error) {
    console.warn('Madge circular dependency analysis failed or returned warnings.', error);
    // Madge might exit with code 1 if there are circular dependencies.
    if (error && typeof error === 'object' && 'stdout' in error) {
      const output = (error.stdout as Buffer).toString();
      fs.writeFileSync('docs/architecture/circular-dependencies.txt', output);
    }
  }
}

analyzeRepo();
