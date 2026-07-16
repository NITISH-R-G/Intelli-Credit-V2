import fs from 'node:fs';
import path from 'node:path';

function analyzeRepo() {
  console.info('Analyzing repository...');

  const docsPath = path.join('docs', 'architecture');
  if (!fs.existsSync(docsPath)) {
    fs.mkdirSync(docsPath, { recursive: true });
  }

  // A basic implementation of repo analysis.
  // This could be expanded to use ASTs or other sophisticated techniques.
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  const dependencies = Object.keys(packageJson.dependencies || {}).join(', ');
  const devDependencies = Object.keys(packageJson.devDependencies || {}).join(', ');

  const analysisContent = `
# Repository Analysis

This document is automatically generated.

## Dependencies
${dependencies}

## Dev Dependencies
${devDependencies}

## Scripts
${Object.keys(packageJson.scripts || {}).join(', ')}
`;

  fs.writeFileSync(path.join(docsPath, 'repo-analysis.md'), analysisContent);
  console.info('Repository analysis generated.');
}

analyzeRepo();
