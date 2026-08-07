import * as fs from 'fs';
import * as path from 'path';

export function getFilesRecursively(directory: string): string[] {
  let files: string[] = [];
  if (!fs.existsSync(directory)) return files;

  const items = fs.readdirSync(directory, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(directory, item.name);
    if (item.isDirectory()) {
      files = files.concat(getFilesRecursively(fullPath));
    } else if (item.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  }

  return files;
}

export function getAllCodeFilesContent(): string {
  const directories = ['src', 'api', 'scripts'];
  let allCode = '';

  for (const dir of directories) {
    const files = getFilesRecursively(dir);
    for (const file of files) {
      allCode += `\n\n--- ${file} ---\n`;
      allCode += fs.readFileSync(file, 'utf8');
    }
  }

  return allCode;
}
