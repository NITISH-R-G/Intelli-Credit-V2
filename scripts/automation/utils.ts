import * as fs from 'node:fs';
import * as path from 'node:path';

export function getFilesRecursively(directory: string): string[] {
  let files: string[] = [];
  try {
    const items = fs.readdirSync(directory, { withFileTypes: true });
    for (const item of items) {
      if (item.name === 'node_modules' || item.name === '.git' || item.name === 'dist') {
        continue;
      }
      const fullPath = path.join(directory, item.name);
      if (item.isDirectory()) {
        files = files.concat(getFilesRecursively(fullPath));
      } else {
        files.push(fullPath);
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${directory}:`, err);
  }
  return files;
}

export function getRepositoryContext(): { fileTree: string; codeContext: string; packageJsonStr: string } {
  const allFiles = getFilesRecursively('.');
  const fileTree = allFiles.join('\n');

  let codeContext = '';
  for (const file of allFiles) {
    if (file.startsWith('src/') || file.startsWith('api/') || file.startsWith('scripts/')) {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          codeContext += `\n--- ${file} ---\n${content}\n`;
        } catch {
          // ignore
        }
      }
    }
  }

  let packageJsonStr = '';
  try {
    packageJsonStr = fs.readFileSync('package.json', 'utf8');
  } catch (err) {
    console.warn('Could not read package.json:', err);
  }

  return { fileTree, codeContext, packageJsonStr };
}
