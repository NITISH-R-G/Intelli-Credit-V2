import * as fs from 'node:fs';

function setupDirectories() {
  const dirs = ['docs/history', 'docs/architecture'];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.info(`Created directory: ${dir}`);
    } else {
      console.info(`Directory exists: ${dir}`);
    }
  }
}

setupDirectories();
