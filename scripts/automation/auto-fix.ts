import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const executeCommand = (command: string, args: string[], description: string) => {
  console.info(`\n⏳ Running: ${description}`);
  try {
    execFileSync(command, args, { encoding: 'utf8', stdio: 'inherit' });
    console.info(`✅ Success: ${description}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed: ${description}`);
    if (error instanceof Error) {
      console.error(error.message);
    }
    return false;
  }
};

const main = () => {
  console.info('🛠️ Starting Autonomous Repository Self-Healing Process...\n');

  const results = [];

  const pkgPath = path.resolve(process.cwd(), 'package.json');

  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (allDeps['eslint']) {
      results.push(executeCommand('npm', ['run', 'lint:fix'], 'Auto-fixing linting issues'));
    } else {
      console.info('⏭️ ESLint not found, skipping lint:fix step.');
    }
  }

  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (allDeps['prettier']) {
      results.push(executeCommand('npx', ['prettier', '--write', '.'], 'Formatting code with Prettier'));
    } else {
      console.info('⏭️ Prettier not found in dependencies, skipping formatting step.');
    }
  }

  results.push(executeCommand('npm', ['audit', 'fix'], 'Auto-fixing security vulnerabilities'));

  console.info('\n💡 Note: For major dependency updates, Dependabot PRs are recommended.');

  const successCount = results.filter(Boolean).length;
  console.info(`\n🎉 Self-Healing Complete. ${successCount}/${results.length} tasks succeeded.`);
};

main();
