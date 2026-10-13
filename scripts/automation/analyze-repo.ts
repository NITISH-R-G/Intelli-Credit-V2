import * as fs from 'node:fs';
import * as path from 'node:path';

interface KnowledgeGraph {
  files: string[];
  modules: Record<string, string[]>;
}

function getFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!['node_modules', '.git', '.github', 'dist', 'coverage', 'docs'].includes(file)) {
        getFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

function generateKnowledgeGraph(): void {
  const graph: KnowledgeGraph = {
    files: [],
    modules: {},
  };

  const coreDirs = ['src', 'api', 'scripts'];
  for (const dir of coreDirs) {
    if (fs.existsSync(dir)) {
      const files = getFiles(dir);
      graph.files.push(...files);
      graph.modules[dir] = files;
    }
  }

  fs.mkdirSync('docs/architecture', { recursive: true });
  fs.writeFileSync(
    'docs/architecture/knowledge-graph.json',
    JSON.stringify(graph, null, 2),
    'utf-8',
  );
  process.stdout.write('Knowledge graph generated successfully.\n');
}

try {
  generateKnowledgeGraph();
} catch {
  process.stderr.write('Error generating knowledge graph.\n');
  process.exit(1);
}
