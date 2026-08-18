import fs from 'node:fs';
import path from 'node:path';

function getAllTSFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('dist')) {
        arrayOfFiles = getAllTSFiles(fullPath, arrayOfFiles);
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

function analyzeRepo(): void {
  const outputDir = 'docs/architecture';

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.info(`Created directory: ${outputDir}`);
  }

  const srcFiles = getAllTSFiles('src');
  const apiFiles = fs.existsSync('api') ? getAllTSFiles('api') : [];

  const report = `# Repository Analysis Report

## Source Files
Count: ${srcFiles.length}

## API Files
Count: ${apiFiles.length}

*This report is auto-generated.*
`;

  fs.writeFileSync(`${outputDir}/repo-analysis.md`, report);
  console.info('Repository analysis written to docs/architecture/repo-analysis.md');
}

analyzeRepo();
