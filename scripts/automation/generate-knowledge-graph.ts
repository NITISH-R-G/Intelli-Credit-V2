import fs from 'node:fs';

async function generateKnowledgeGraph(): Promise<void> {
    try {
        console.info('Starting Knowledge Graph Generation...');
        fs.mkdirSync('docs/architecture', { recursive: true });

        const graphData = {
            nodes: [
                { id: "App", group: 1 },
                { id: "Components", group: 2 }
            ],
            links: [
                { source: "App", target: "Components", value: 1 }
            ]
        };
        fs.writeFileSync('docs/architecture/knowledge-graph.json', JSON.stringify(graphData, null, 2), 'utf8');
        console.info('Knowledge graph generated.');
    } catch (err) {
        console.error('Error generating knowledge graph:', err);
    }
}

void generateKnowledgeGraph();
