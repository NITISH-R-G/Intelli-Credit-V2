import * as fs from 'node:fs';
import * as path from 'node:path';

function getFiles(dir: string, fileList: string[] = []): string[] {
  const ignoredDirs = ['node_modules', '.git', 'dist', 'coverage', '.github'];

  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        if (!ignoredDirs.includes(file)) {
          getFiles(filePath, fileList);
        }
      } else {
        if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.json') || filePath.endsWith('.md')) {
          fileList.push(filePath);
        }
      }
    }
  } catch (error) {
    process.stderr.write(`Failed reading dir ${dir}: ${error}\n`);
  }
  return fileList;
}

function generateKnowledgeGraph() {
  process.stdout.write('Generating Knowledge Graph...\n');
  const allFiles = getFiles('.');

  const graph: Record<string, unknown> = {
    repository: 'Intelli-Credit',
    timestamp: new Date().toISOString(),
    files: allFiles.length,
    structure: {}
  };

  for (const file of allFiles) {
    const ext = path.extname(file);
    if (!graph.structure[ext as keyof typeof graph.structure]) {
       (graph.structure as Record<string, string[]>)[ext] = [];
    }
    (graph.structure as Record<string, string[]>)[ext].push(file);
  }

  const outputDir = 'docs/architecture';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(`${outputDir}/knowledge-graph.json`, JSON.stringify(graph, null, 2));
  process.stdout.write(`Knowledge graph generated at ${outputDir}/knowledge-graph.json\n`);
}

generateKnowledgeGraph();
