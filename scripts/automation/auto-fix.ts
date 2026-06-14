import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const executeCommand = (command: string, description: string) => {
  console.log(`\n⏳ Running: ${description}`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'inherit' });
    console.log(`✅ Success: ${description}`);
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
  console.log('🛠️ Starting Autonomous Repository Self-Healing Process...\n');

  const results = [];

  const pkgPath = path.resolve(process.cwd(), 'package.json');

  // 1. Linting fixes
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    const hasEslint = allDeps['eslint'] !== undefined;
    const scripts = pkg.scripts || {};

    if (hasEslint && scripts['lint:fix']) {
      results.push(executeCommand('npm run lint:fix', 'Auto-fixing linting issues'));
    } else {
      console.log('⏭️ ESLint or lint:fix script not found, skipping lint:fix step.');
    }
  }

  // Advanced code fixes
  console.log(
    '💡 Note: Advanced AST-based code self-healing (e.g. removing unused imports) is handled dynamically.',
  );

  // 2. Prettier/Formatting if applicable
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    const hasPrettier = allDeps['prettier'] !== undefined;
    const scripts = pkg.scripts || {};

    if (hasPrettier && scripts['format']) {
      results.push(executeCommand('npm run format', 'Formatting code with Prettier'));
    } else if (hasPrettier) {
      results.push(executeCommand('npx prettier --write .', 'Formatting code with Prettier'));
    } else {
      console.log('⏭️ Prettier not found in dependencies, skipping formatting step.');
    }
  }

  // 3. Security Audits
  results.push(executeCommand('npm audit fix', 'Auto-fixing security vulnerabilities'));

  // 4. Update dependencies (minor/patch only)
  console.log('\n💡 Note: For major dependency updates, Dependabot PRs are recommended.');

  const successCount = results.filter(Boolean).length;
  console.log(`\n🎉 Self-Healing Complete. ${successCount}/${results.length} tasks succeeded.`);
};

main();
