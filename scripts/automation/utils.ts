import * as fs from 'node:fs';
import * as path from 'node:path';

export function getFiles(dir: string, fileList: string[] = []): string[] {
  const ignoredDirs = ['node_modules', '.git', 'dist', 'coverage', '.github'];

  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        if (!ignoredDirs.includes(file)) {
          getFiles(filePath, fileList);
        }
      } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.json') || filePath.endsWith('.md')) {
        fileList.push(filePath);
      }
    }
  } catch (error) {
    process.stderr.write(`Failed reading dir ${dir}: ${error}\n`);
  }
  return fileList;
}
