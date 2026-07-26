import fs from 'node:fs';
import path from 'node:path';

function analyzeRepo(): void {
  console.info('Analyzing repository structure...');

  const outputDir = path.join('docs', 'architecture');
  fs.mkdirSync(outputDir, { recursive: true });

  const outputFile = path.join(outputDir, 'repo-analysis.md');

  // Simple script to gather top level info and package.json info
  const packageJsonStr = fs.readFileSync('package.json', 'utf8');
  const pkg = JSON.parse(packageJsonStr);

  const dependencies = pkg.dependencies ? Object.keys(pkg.dependencies).length : 0;
  const devDependencies = pkg.devDependencies ? Object.keys(pkg.devDependencies).length : 0;

  const report = `# Repository Analysis

## Project Info
- **Name**: ${pkg.name}
- **Version**: ${pkg.version}
- **Description**: ${pkg.description || 'N/A'}

## Dependencies
- **Dependencies count**: ${dependencies}
- **Dev Dependencies count**: ${devDependencies}

*This report is automatically generated.*
`;

  try {
    fs.writeFileSync(outputFile, report, 'utf8');
    console.info(`Repository analysis generated successfully at ${outputFile}.`);
  } catch (error: any) {
    console.error('Error generating repository analysis:', error.message || error);
    process.exit(1);
  }
}

analyzeRepo();
