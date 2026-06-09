import { execSync } from 'child_process';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const logSuccess = (description: string) => console.info(`✅ Success: ${description}`);
const logFailure = (description: string, error: unknown) => {
  console.error(`❌ Failed: ${description}`);
  if (error instanceof Error) {
    console.error(error.message);
  }
};

const main = async () => {
  console.info('🛠️ Starting Autonomous Repository Self-Healing Process...\n');

  const results = [];
  const pkgPath = path.resolve(process.cwd(), 'package.json');

  // 1. Linting fixes
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (allDeps['eslint']) {
      console.info('\n⏳ Running: Auto-fixing linting issues');
      try {
        execSync('npm run lint:fix', { encoding: 'utf8', stdio: 'inherit' });
        logSuccess('Auto-fixing linting issues');
        results.push(true);
      } catch (e) {
        logFailure('Auto-fixing linting issues', e);
        results.push(false);
      }
    } else {
      console.info('⏭️ ESLint not found, skipping lint:fix step.');
    }
  }

  // 2. Prettier/Formatting
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (allDeps['prettier']) {
      console.info('\n⏳ Running: Formatting code with Prettier');
      try {
        execSync('npx prettier --write .', { encoding: 'utf8', stdio: 'inherit' });
        logSuccess('Formatting code with Prettier');
        results.push(true);
      } catch (e) {
        logFailure('Formatting code with Prettier', e);
        results.push(false);
      }
    } else {
      console.info('⏭️ Prettier not found in dependencies, skipping formatting step.');
    }
  }

  // 3. Security Audits
  console.info('\n⏳ Running: Auto-fixing security vulnerabilities');
  try {
    execSync('npm audit fix', { encoding: 'utf8', stdio: 'inherit' });
    logSuccess('Auto-fixing security vulnerabilities');
    results.push(true);
  } catch (e) {
    logFailure('Auto-fixing security vulnerabilities', e);
    results.push(false);
  }

  // 4. Update dependencies and lockfiles safely
  console.info('\n⏳ Running: Updating lockfile securely');
  try {
    execSync('npm install --package-lock-only', { encoding: 'utf8', stdio: 'inherit' });
    logSuccess('Updating lockfile securely');
    results.push(true);
  } catch (e) {
    logFailure('Updating lockfile securely', e);
    results.push(false);
  }

  console.info('\n⏳ Running: Optimizing dependency tree (dedupe)');
  try {
    execSync('npm dedupe', { encoding: 'utf8', stdio: 'inherit' });
    logSuccess('Optimizing dependency tree (dedupe)');
    results.push(true);
  } catch (e) {
    logFailure('Optimizing dependency tree (dedupe)', e);
    results.push(false);
  }

  console.info('\n💡 Note: For major dependency updates, Dependabot PRs are recommended.');

  const successCount = results.filter(Boolean).length;
  console.info(`\n🎉 Self-Healing Complete. ${successCount}/${results.length} tasks succeeded.`);
};

main().catch(console.error);
