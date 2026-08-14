import fs from 'node:fs';
import path from 'node:path';

interface Node {
    id: string;
    type: 'file' | 'directory';
    children: string[];
}

function buildGraph(dirPath: string, graph: Record<string, Node> = {}): Record<string, Node> {
    const files = fs.readdirSync(dirPath);

    graph[dirPath] = {
        id: dirPath,
        type: 'directory',
        children: []
    };

    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (file === 'node_modules' || file === '.git' || file === 'dist') return;

        graph[dirPath].children.push(fullPath);

        if (fs.statSync(fullPath).isDirectory()) {
            buildGraph(fullPath, graph);
        } else {
            graph[fullPath] = {
                id: fullPath,
                type: 'file',
                children: []
            };
        }
    });

    return graph;
}

function generate(): void {
    console.info('Generating repository knowledge graph...');

    fs.mkdirSync('docs/architecture', { recursive: true });

    const graph = buildGraph('.');

    let markdown = '# Repository Knowledge Graph\n\n';
    markdown += 'This is an automatically generated map of the repository structure.\n\n';

    for (const [id, node] of Object.entries(graph)) {
        if (node.type === 'directory' && node.children.length > 0) {
            markdown += `## ${id}\n`;
            node.children.forEach(child => {
                markdown += `- ${child}\n`;
            });
            markdown += '\n';
        }
    }

    fs.writeFileSync('docs/architecture/knowledge-graph.md', markdown);
    console.info('Knowledge graph generated successfully.');
}

generate();
