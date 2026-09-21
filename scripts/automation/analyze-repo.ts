import * as fs from 'node:fs';

function analyze(): void {
  console.info('Starting basic repository analysis...');
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const deps = Object.keys(pkg.dependencies ?? {}).length;
    const devDeps = Object.keys(pkg.devDependencies ?? {}).length;

    console.info(`Found ${deps} dependencies and ${devDeps} devDependencies.`);
    console.info('Repository analysis complete.');
  } catch (error) {
    console.error('Error analyzing repository:', error);
    process.exit(1);
  }
}

analyze();
