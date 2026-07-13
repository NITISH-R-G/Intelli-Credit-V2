import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

function getFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist'].includes(file)) {
        getFiles(path.join(dir, file), fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.md')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

function analyzeRepo() {
  console.info('Starting repository analysis...');
  const files = getFiles(process.cwd());
  let tsFiles = 0;
  let mdFiles = 0;
  let tsxFiles = 0;

  files.forEach((f) => {
    if (f.endsWith('.ts')) tsFiles++;
    else if (f.endsWith('.tsx')) tsxFiles++;
    else if (f.endsWith('.md')) mdFiles++;
  });

  const report = `Repository Analysis:
- TypeScript files: ${tsFiles}
- React component files: ${tsxFiles}
- Markdown files: ${mdFiles}
- Total tracked files: ${files.length}
`;
  console.info(report);
  console.info('Repository analysis complete.');
}

analyzeRepo();
