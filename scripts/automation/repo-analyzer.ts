import fs from 'fs';
import path from 'path';

interface RepoMetadata {
  name: string;
  description: string;
  version: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
  frameworks: string[];
  structure: Record<string, unknown>;
}

const analyzePackageJson = (): Partial<RepoMetadata> => {
  const pkgPath = path.resolve(process.cwd(), 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    // Naive framework detection
    const frameworks = [];
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (allDeps['react']) frameworks.push('React');
    if (allDeps['express']) frameworks.push('Express');
    if (allDeps['vite']) frameworks.push('Vite');
    if (allDeps['tailwindcss']) frameworks.push('TailwindCSS');

    return {
      name: pkg.name || 'Unknown Project',
      description: pkg.description || '',
      version: pkg.version || '0.0.0',
      dependencies: pkg.dependencies || {},
      devDependencies: pkg.devDependencies || {},
      scripts: pkg.scripts || {},
      frameworks,
    };
  }
  return {};
};

const mapDirectory = (dir: string, depth = 0, maxDepth = 3): Record<string, unknown> => {
  if (depth > maxDepth) return null;
  const items = fs.readdirSync(dir);
  const structure: Record<string, any> = {};

  for (const item of items) {
    if (['node_modules', '.git', 'dist', 'build'].includes(item)) continue;

    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      structure[item] = mapDirectory(fullPath, depth + 1, maxDepth);
    } else {
      structure[item] = 'file';
    }
  }
  return structure;
};

const main = () => {
  console.info('Analyzing repository...');

  const pkgMeta = analyzePackageJson();
  const structure = mapDirectory(process.cwd());

  const metadata: RepoMetadata = {
    name: pkgMeta.name || '',
    description: pkgMeta.description || '',
    version: pkgMeta.version || '',
    dependencies: pkgMeta.dependencies || {},
    devDependencies: pkgMeta.devDependencies || {},
    scripts: pkgMeta.scripts || {},
    frameworks: pkgMeta.frameworks || [],
    structure,
  };

  fs.writeFileSync(path.resolve(process.cwd(), 'metadata.json'), JSON.stringify(metadata, null, 2));
  console.info('Analysis complete. Saved to metadata.json');
};

main();
