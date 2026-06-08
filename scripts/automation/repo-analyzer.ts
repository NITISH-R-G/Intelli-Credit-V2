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
  structure: any;
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

const mapDirectory = (dir: string, depth = 0, maxDepth = 3): any => {
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
  console.log('Analyzing repository...');

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
  console.log('Analysis complete. Saved to metadata.json');

  // Also generate the initial knowledge graph data
  const knowledgeGraph = {
    nodes: [
      { id: 'Repository', type: 'root', name: metadata.name },
      ...Object.keys(metadata.dependencies).map(dep => ({ id: dep, type: 'dependency', name: dep })),
      ...Object.keys(metadata.scripts).map(script => ({ id: script, type: 'script', name: script })),
    ],
    edges: [
      ...Object.keys(metadata.dependencies).map(dep => ({ source: 'Repository', target: dep, relation: 'depends_on' })),
      ...Object.keys(metadata.scripts).map(script => ({ source: 'Repository', target: script, relation: 'runs' })),
    ]
  };

  const docsDir = path.resolve(process.cwd(), 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  fs.writeFileSync(path.join(docsDir, 'knowledge-graph.json'), JSON.stringify(knowledgeGraph, null, 2));
  console.log('Knowledge graph raw data generated at docs/knowledge-graph.json');
};

main();
