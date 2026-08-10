import fs from 'node:fs';
import path from 'node:path';

function analyze() {
  console.info('Starting repository analysis...');
  fs.mkdirSync('docs/architecture', { recursive: true });

  let packageJson: any = {};
  try {
    packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  } catch (e) {
    console.error('Failed to read package.json');
  }

  const dependencies = Object.keys(packageJson.dependencies || {}).length;
  const devDependencies = Object.keys(packageJson.devDependencies || {}).length;

  const report = `# Repository Analysis Report

## Overview
This report provides an automated snapshot of the repository's health, dependencies, and structure.

## Dependencies
- **Production Dependencies:** ${dependencies}
- **Development Dependencies:** ${devDependencies}

## Scripts
- **Available Scripts:** ${Object.keys(packageJson.scripts || {}).join(', ')}

## Recommendations
- Regularly update dependencies to mitigate security risks (Dependabot is configured).
- Ensure all automated tasks in \`scripts/automation/\` are functioning properly.
- Keep architectural documentation up to date.

*Generated automatically by \`analyze-repo.ts\`.*
`;

  fs.writeFileSync('docs/architecture/repo-analysis.md', report, 'utf8');
  console.info('Repository analysis report generated at docs/architecture/repo-analysis.md');
}

analyze();
