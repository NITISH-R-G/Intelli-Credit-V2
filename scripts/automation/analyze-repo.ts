import * as fs from 'fs';

function analyzeRepo() {
  console.info('Analyzing Repository Health...');
  let reportMd = '# Repository Health Report\n\n';

  try {
    const pkgStr = fs.readFileSync('package.json', 'utf8');
    const pkg = JSON.parse(pkgStr);

    reportMd += `## Dependencies\n`;
    reportMd += `- Dependencies count: ${Object.keys(pkg.dependencies || {}).length}\n`;
    reportMd += `- DevDependencies count: ${Object.keys(pkg.devDependencies || {}).length}\n\n`;

    reportMd += `## Scripts\n`;
    reportMd += `- Scripts count: ${Object.keys(pkg.scripts || {}).length}\n\n`;

    if (!fs.existsSync('docs')) {
      fs.mkdirSync('docs');
    }
    fs.writeFileSync('docs/repo-health.md', reportMd);
    console.info('Repository analysis generated at docs/repo-health.md');
  } catch (error) {
    console.error('Failed to analyze package.json:', error);
    process.exitCode = 1;
  }
}

analyzeRepo();
