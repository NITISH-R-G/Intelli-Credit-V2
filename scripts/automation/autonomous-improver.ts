import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const searchForTodos = (dir: string): string[] => {
  const todos: string[] = [];
  try {
    const result = execSync(`grep -rnw '${dir}' -e 'TODO' --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build --exclude-dir=.git`, { encoding: 'utf8' });
    if (result) {
      todos.push(...result.trim().split('\n'));
    }
  } catch (error) {
    // grep returns exit code 1 if no matches found
  }
  return todos;
};

const main = async () => {
  console.log('Running Autonomous Repository Improver...');

  const todos = searchForTodos('src');
  const scriptsTodos = searchForTodos('scripts');

  const allTodos = [...todos, ...scriptsTodos];

  if (allTodos.length === 0) {
    console.log('No technical debt (TODOs) found. Repository is pristine!');
    return;
  }

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
  console.log('Technical debt report generated successfully at docs/technical-debt-report.md.');

  // In a real scenario, this script could use the GitHub API to open issues for each TODO,
  // but to prevent spamming, we just generate a report and a PR could be opened by another action.
};

main().catch(console.error);
