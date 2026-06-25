import * as fs from 'fs';
import * as path from 'path';

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        arrayOfFiles.push(path.join(dirPath, '/', file));
      }
    }
  });

  return arrayOfFiles;
}

function generateKnowledgeGraph() {
  console.info('Generating Knowledge Graph...');
  const files = getAllFiles('src');
  let graphMd = '# Repository Knowledge Graph\n\n';

  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');
    const functions = content.match(/function\s+([a-zA-Z0-9_]+)/g);
    const classes = content.match(/class\s+([a-zA-Z0-9_]+)/g);
    const constFuncs = content.match(/const\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g);

    if (functions || classes || constFuncs) {
      graphMd += `## \`${file}\`\n\n`;

      if (functions) {
        graphMd += '### Functions\n';
        functions.forEach((f) => {
          graphMd += `- \`${f.replace('function ', '')}\`\n`;
        });
        graphMd += '\n';
      }

      if (constFuncs) {
        graphMd += '### Arrow Functions\n';
        constFuncs.forEach((f) => {
          const match = f.match(/const\s+([a-zA-Z0-9_]+)/);
          if (match) {
            graphMd += `- \`${match[1]}\`\n`;
          }
        });
        graphMd += '\n';
      }

      if (classes) {
        graphMd += '### Classes\n';
        classes.forEach((c) => {
          graphMd += `- \`${c.replace('class ', '')}\`\n`;
        });
        graphMd += '\n';
      }
    }
  });

  if (!fs.existsSync('docs')) {
    fs.mkdirSync('docs');
  }

  fs.writeFileSync('docs/knowledge-graph.md', graphMd);
  console.info('Knowledge graph generated at docs/knowledge-graph.md');
}

generateKnowledgeGraph();
