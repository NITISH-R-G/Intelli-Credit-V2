import fs from 'fs';
import path from 'path';

const searchForTodos = (dir: string): string[] => {
  if (!/^[a-zA-Z0-9_-]+$/.test(dir)) {
    throw new Error('Invalid directory name');
  }
  const todos: string[] = [];

  const scanDirectory = (currentDir: string) => {
    if (!fs.existsSync(currentDir)) return;

    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (['node_modules', 'dist', 'build', '.git'].includes(entry.name)) {
        continue;
      }

      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx'))) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('TODO')) {
              todos.push(`${fullPath}:${i + 1}:${lines[i].trim()}`);
            }
          }
        } catch {
          // ignore read errors
        }
      }
    }
  };

  scanDirectory(dir);
  return todos;
};

const main = async () => {
  // eslint-disable-next-line no-console
  console.log('Running Autonomous Repository Improver...');

  const todos = searchForTodos('src');
  const scriptsTodos = searchForTodos('scripts');

  const allTodos = [...todos, ...scriptsTodos];

  if (allTodos.length === 0) {
    // eslint-disable-next-line no-console
    console.log('No technical debt (TODOs) found. Repository is pristine!');
    return;
  }

  // eslint-disable-next-line no-console
  console.log(`Found ${allTodos.length} technical debt items.`);

  const reportPath = path.resolve(process.cwd(), 'docs/technical-debt-report.md');

  let reportContent = '# Technical Debt Report\n\n';
  reportContent += `Generated on: ${new Date().toISOString()}\n\n`;
  reportContent += 'The following `TODO` comments were found in the codebase. Consider addressing them to improve repository health.\n\n';

  reportContent += '```text\n';
  allTodos.forEach(todo => {
    reportContent += `${todo}\n`;
  });
  reportContent += '```\n';

  const outDir = path.dirname(reportPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, reportContent);
  // eslint-disable-next-line no-console
  console.log('Technical debt report generated successfully at docs/technical-debt-report.md.');

  // In a real scenario, this script could use the GitHub API to open issues for each TODO,
  // but to prevent spamming, we just generate a report and a PR could be opened by another action.
};

// eslint-disable-next-line no-console
main().catch(console.error);
